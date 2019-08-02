import { Component } from '@nelts/process';
let id = 1;
const TIMEOUT = 20000;

type ipcStatus = 0 | 1;
export type MessageSendOptions = string | number | { to?: string | number, socket?: any, timeout?: number };
export type ReplyData = (code: ipcStatus, data: any) => void;

export interface MessageReceiveDataOptions {
  id: number,
  to: string | number,
  from: number,
  method?: string,
  data: any,
  code?: ipcStatus
};

export interface NewAgentMessageReceiveDataOptions extends MessageReceiveDataOptions {
  data: {
    name: string,
    file: string,
    args: {
      base: string, 
      config: string,
      file: string,
      name: string,
      mpid: number,
    }
  }
}

export declare class WidgetMessager {
  receiveMessage(message: MessageReceiveDataOptions, socket?: any): void;
}

export default class Messager<APP extends Component> {
  private _stacks: { [name: string]: [(value?: any) => void, (reason?: any) => void] } = {};
  public readonly app: APP;
  public mpid: number;
  constructor(app: APP, mpid: number) {
    this.app = app;
    this.mpid = mpid;
  }

  onMessageFeedBack(message: MessageReceiveDataOptions, next: Function) {
    if (message.to === process.pid && !message.method && message.code) {
      this.parse(message.id, message.code, message.data);
    } else {
      next();
    }
  }

  parse(id: number, code: ipcStatus, data: any) {
    if (this._stacks[id]) {
      const callback = this._stacks[id][code];
      if (code === 1 && typeof data === 'string' && !!data) data = new Error(data);
      callback(data);
    }
  }

  asyncHealth() {
    return this.asyncSend('health');
  }

  send(method: string, data?: any, options?: MessageSendOptions) {
    if (!options) options = this.mpid;
    if (typeof options !== 'object') {
      options = {
        to: options,
      }
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
    } else {
      // 兼容master情况
      if (typeof to === 'number' && this.app.processer.pids[to]) {
        this.app.processer.pids[to].send(sendData, options.socket)
      } else if (typeof to === 'string' && this.app.processer.agents[to]) {
        this.app.processer.agents[to].send(sendData, options.socket);
      } else {
        throw new Error('options.to must be a number or a string, but got ' + typeof to + ' in master process');
      }
    }
    return _id;
  }

  asyncSend(method: string, data?: any, options?: MessageSendOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const _id = this.send(method, data, options);
      const timeout = typeof options === 'object' ? (options.timeout || TIMEOUT) : TIMEOUT;
      const timer = setTimeout(() => {
        if (this._stacks[_id]) {
          delete this._stacks[_id];
          reject(new Error('[Messager] ipc request timeout: ' + timeout + 'ms'));
        }
      }, timeout);
      const resolver = (value?: any) => {
        clearTimeout(timer);
        delete this._stacks[_id];
        resolve(value);
      }
      const rejecter = (reason?: any) => {
        clearTimeout(timer);
        delete this._stacks[_id];
        reject(reason);
      }
      this._stacks[_id] = [resolver, rejecter];
    });
  }

  createReply(isMaster: boolean, message: MessageReceiveDataOptions, socket?: any): ReplyData {
    const target = isMaster ? this.app.processer.pids[message.from] : process;
    if (!target) throw new Error('cannot find the process of ' + message.from);
    return (code: ipcStatus, data: any) => {
      target.send({
        id: message.id,
        to: message.from,
        from: process.pid,
        data,
        code,
      }, socket);
    }
  }
}