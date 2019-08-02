"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class AgentMessager extends base_1.default {
    constructor(app, mpid) {
        super(app, mpid);
    }
    receiveMessage(message, socket) {
        this.onMessageFeedBack(message, () => {
            const reply = this.createReply(false, message, socket);
            switch (message.method) {
                case 'event:get:ready':
                    this.ready(reply, socket);
                    break;
                case 'event:get:health':
                    this.health(reply, socket);
                    break;
                default: this.hybrid(message, reply, socket);
            }
        });
    }
    ready(reply, socket) {
        this.app.emit('ready', socket)
            .then(() => reply(0, null))
            .catch(e => reply(1, e.message));
    }
    health(reply, socket) {
        let result;
        const callback = (data) => result = data;
        this.app.emit('health', callback, socket)
            .then(() => reply(0, result))
            .catch(e => reply(1, e.message));
    }
    hybrid(message, reply, socket) {
        let result, shouldReply = false;
        const callback = (data, replyValue) => {
            result = data;
            shouldReply = replyValue;
        };
        this.app.emit('hybrid', message, callback, socket)
            .then(() => shouldReply && reply(0, result))
            .catch(e => {
            if (shouldReply) {
                reply(1, e.message);
            }
            else {
                this.app.processer.logger.error(e);
            }
        });
    }
}
exports.default = AgentMessager;
