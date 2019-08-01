"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class MasterMessager extends base_1.default {
    constructor(app) {
        super(app, process.pid);
    }
    receiveMessage(message, socket) {
        this.onMessageFeedBack(message, () => {
            const reply = this.createReply(true, message, socket);
            switch (message.method) {
                case 'event:put:agent':
                    this.createNewAgent(message, reply);
                    break;
                case 'event:get:health':
                    this.getHealthData(reply);
                    break;
                case 'event:post:notice':
                    this.notify(message);
                    break;
            }
        });
    }
    notify(message) {
        const workers = this.app.processer.workers;
        workers.forEach(worker => this.send('event:get:notice', message.data, { to: worker.pid }));
    }
    getHealthData(reply) {
        const agents = Object.keys(this.app.processer.agents);
        Promise.all(agents.map(agent => this.asyncSend('event:get:health', null, agent))).then(datas => {
            const result = {};
            datas.forEach((data, index) => {
                result[agents[index]] = data || {};
                result[agents[index]].pid = this.app.processer.agents[agents[index]].pid;
            });
            reply(0, result);
        }).catch(e => reply(1, (e && e.message) || 'Get health catch error.'));
    }
    createNewAgent(message, reply) {
        if (this.app.processer.agents[message.data.name])
            return reply(0, {
                pid: this.app.processer.agents[message.data.name].pid,
                time: 0,
            });
        const startCreateAgentTime = Date.now();
        this.app.createAgent(message.data.name, message.data.file, message.data.args)
            .then((node) => reply(0, {
            time: Date.now() - startCreateAgentTime,
            pid: node.pid,
        }))
            .catch(e => reply(1, (e && e.message) || `Agnet[${message.data.name}] start catch error on runtime, please see logs.`));
    }
}
exports.default = MasterMessager;
