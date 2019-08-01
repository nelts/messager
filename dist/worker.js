"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class WorkerMessager extends base_1.default {
    constructor(app, mpid) {
        super(app, mpid);
    }
    receiveMessage(message, socket) {
        this.onMessageFeedBack(message, () => {
            const reply = this.createReply(false, message, socket);
            switch (message.method) {
                case 'event:get:notice':
                    this.notify(message, socket);
                    break;
                case 'event:get:ready':
                    this.ready(reply, socket);
                    break;
            }
        });
    }
    notify(message, socket) {
        this.app.emit('notify', message.data, socket).catch(e => this.app.emit('error', e));
    }
    ready(reply, socket) {
        this.app.emit('ready', socket)
            .then(() => reply(0, null))
            .catch(e => reply(1, e.message));
    }
}
exports.default = WorkerMessager;
