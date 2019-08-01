import { Component, Node } from '@nelts/process';
import Base, { WidgetMessager, MessageReceiveDataOptions, NewAgentMessageReceiveDataOptions, ReplyData } from './base';

export default class MasterMessager<APP extends Component> extends Base<APP> implements WidgetMessager {
  constructor(app: APP) {
    super(app, process.pid);
  }

  receiveMessage(message: MessageReceiveDataOptions, socket?: any) {
    this.onMessageFeedBack(message, () => {
      const reply = this.createReply(true, message, socket);
      switch (message.method) {
        case 'event:put:agent': this.createNewAgent(message, reply); break;
        case 'event:get:health': this.getHealthData(reply); break;
        case 'event:post:notice': this.notify(message); break;
      }
    })
  }

  private notify(message: MessageReceiveDataOptions) {
    const workers = this.app.processer.workers;
    workers.forEach(worker => this.send('event:get:notice', message.data, { to: worker.pid }));
  }

  private getHealthData(reply: ReplyData) {
    const agents = Object.keys(this.app.processer.agents);
    Promise.all(agents.map(agent => this.asyncSend('event:get:health', null, agent))).then(datas => {
      const result: { [name: string]: any } = {};
      datas.forEach((data, index) => {
        result[agents[index]] = data || {};
        result[agents[index]].pid = this.app.processer.agents[agents[index]].pid;
      });
      reply(0, result);
    }).catch(e => reply(1, (e && e.message) || 'Get health catch error.'));
  }

  private createNewAgent(message: NewAgentMessageReceiveDataOptions, reply: ReplyData) {
    if (this.app.processer.agents[message.data.name]) return reply(0, {
      pid: this.app.processer.agents[message.data.name].pid,
      time: 0,
    });
    const startCreateAgentTime = Date.now();
    this.app.createAgent(message.data.name, message.data.file, message.data.args)
      .then((node: Node) => reply(0, {
        time: Date.now() - startCreateAgentTime,
        pid: node.pid,
      }))
      .catch(e => reply(1, (e && e.message) || `Agnet[${message.data.name}] start catch error on runtime, please see logs.`));
  }
}