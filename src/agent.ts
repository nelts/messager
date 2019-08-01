import { Component } from '@nelts/process';
import Base, { WidgetMessager, MessageReceiveDataOptions, ReplyData } from './base';

export default class AgentMessager<APP extends Component> extends Base<APP> implements WidgetMessager {
  constructor(app: APP, mpid: number) {
    super(app, mpid);
  }

  receiveMessage(message: MessageReceiveDataOptions, socket?: any) {
    this.onMessageFeedBack(message, () => {
      const reply = this.createReply(false, message, socket);
      switch (message.method) {
        case 'event:get:ready': this.ready(reply, socket); break;
        case 'event:get:health': this.health(reply, socket); break;
        default: this.hybrid(message, reply, socket);
      }
    })
  }

  private ready(reply: ReplyData, socket?: any) {
    this.app.emit('ready', socket)
      .then(() => reply(0, null))
      .catch(e => reply(1, e.message));
  }

  private health(reply: ReplyData, socket?: any) {
    let result: any;
    const callback = (data: any) => result = data;
    this.app.emit('health', callback, socket)
      .then(() => reply(0, result))
      .catch(e => reply(1, e.message));
  }

  private hybrid(message: MessageReceiveDataOptions, reply: ReplyData, socket?: any) {
    let result: any;
    const callback = (data: any) => result = data;
    this.app.emit('hybrid', message, callback, socket)
      .then(() => reply(0, result))
      .catch(e => reply(1, e.message));
  }
}