"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let id = 1;
const TIMEOUT = 20000;
;
class Messager {
    constructor(app, mpid) {
        this._stacks = {};
        this.app = app;
        this.mpid = mpid;
    }
    onMessageFeedBack(message, next) {
        if (message.to === process.pid && !message.method && message.code !== undefined && message.code !== null) {
            this.parse(message.id, message.code, message.data);
        }
        else {
            next();
        }
    }
    parse(id, code, data) {
        if (this._stacks[id]) {
            const callback = this._stacks[id][code];
            if (code === 1 && typeof data === 'string' && !!data)
                data = new Error(data);
            callback(data);
        }
    }
    asyncHealth() {
        return this.asyncSend('health');
    }
    send(method, data, options) {
        if (!options)
            options = this.mpid;
        if (typeof options !== 'object') {
            options = {
                to: options,
            };
        }
        const _id = id++;
        const to = options.to || this.mpid;
        const sendData = {
            id: _id,
            to,
            from: process.pid,
            method, data,
        };
        if (this.mpid !== process.pid) {
            process.send(sendData, options.socket);
        }
        else {
            if (typeof to === 'number' && this.app.processer.pids[to]) {
                this.app.processer.pids[to].send(sendData, options.socket);
            }
            else if (typeof to === 'string' && this.app.processer.agents[to]) {
                this.app.processer.agents[to].send(sendData, options.socket);
            }
            else {
                throw new Error('options.to must be a number or a string, but got ' + typeof to + ' in master process');
            }
        }
        return _id;
    }
    asyncSend(method, data, options) {
        return new Promise((resolve, reject) => {
            const _id = this.send(method, data, options);
            const timeout = typeof options === 'object' ? (options.timeout || TIMEOUT) : TIMEOUT;
            const timer = setTimeout(() => {
                if (this._stacks[_id]) {
                    delete this._stacks[_id];
                    reject(new Error('[Messager] ipc request timeout: ' + timeout + 'ms'));
                }
            }, timeout);
            const resolver = (value) => {
                clearTimeout(timer);
                delete this._stacks[_id];
                resolve(value);
            };
            const rejecter = (reason) => {
                clearTimeout(timer);
                delete this._stacks[_id];
                reject(reason);
            };
            this._stacks[_id] = [resolver, rejecter];
        });
    }
    createReply(isMaster, message, socket) {
        const target = isMaster ? this.app.processer.pids[message.from] : process;
        if (!target)
            throw new Error('cannot find the process of ' + message.from);
        return (code, data) => {
            target.send({
                id: message.id,
                to: message.from,
                from: process.pid,
                data,
                code,
            }, socket);
        };
    }
}
exports.default = Messager;
