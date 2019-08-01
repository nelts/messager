import { Component } from '@nelts/process';
import Base, { WidgetMessager, MessageReceiveDataOptions } from './base';
export default class WorkerMessager<APP extends Component> extends Base<APP> implements WidgetMessager {
    constructor(app: APP, mpid: number);
    receiveMessage(message: MessageReceiveDataOptions, socket?: any): void;
    private notify;
    private ready;
}
