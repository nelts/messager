import { Component } from '@nelts/process';
import Base, { WidgetMessager, MessageReceiveDataOptions } from './base';
export default class MasterMessager<APP extends Component> extends Base<APP> implements WidgetMessager {
    constructor(app: APP);
    receiveMessage(message: MessageReceiveDataOptions, socket?: any): void;
    private notify;
    private getHealthData;
    private createNewAgent;
}
