import { Component } from '@nelts/process';
import Base, { WidgetMessager, MessageReceiveDataOptions, ReplyData } from './base';

export default class WorkerMessager<APP extends Component> extends Base<APP> implements WidgetMessager {
  constructor(app: APP, mpid: number) {
    super(app, mpid);
  }

  receiveMessage(message: MessageReceiveDataOptions, socket?: any) {
    this.onMessageFeedBack(message, () => {
      const reply = this.createReply(false, message, socket);
      switch (message.method) {
        case 'event:get:notice': this.notify(message, socket); break;
        case 'event:get:ready': this.ready(reply, socket); break;
      }
    })
  }

  private notify(message: MessageReceiveDataOptions, socket?: any) {
    this.app.emit('notify', message.data, socket).catch(e => this.app.emit('error', e));
  }

  private ready(reply: ReplyData, socket?: any) {
    this.app.emit('ready', socket)
      .then(() => reply(0, null))
      .catch(e => reply(1, e.message));
  }
}