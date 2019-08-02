import { Component } from '@nelts/process';
declare type ipcStatus = 0 | 1;
export declare type MessageSendOptions = string | number | {
    to?: string | number;
    socket?: any;
    timeout?: number;
};
export declare type ReplyData = (code: ipcStatus, data: any) => void;
export interface MessageReceiveDataOptions {
    id: number;
    to: string | number;
    from: number;
    method?: string;
    data: any;
    code?: ipcStatus;
}
export interface NewAgentMessageReceiveDataOptions extends MessageReceiveDataOptions {
    data: {
        name: string;
        file: string;
        args: {
            base: string;
            config: string;
            file: string;
            name: string;
            mpid: number;
        };
    };
}
export declare class WidgetMessager {
    receiveMessage(message: MessageReceiveDataOptions, socket?: any): void;
}
export default class Messager<APP extends Component> {
    private _stacks;
    readonly app: APP;
    mpid: number;
    constructor(app: APP, mpid: number);
    onMessageFeedBack(message: MessageReceiveDataOptions, next: Function): void;
    parse(id: number, code: ipcStatus, data: any): void;
    send(method: string, data?: any, options?: MessageSendOptions): number;
    asyncSend(method: string, data?: any, options?: MessageSendOptions): Promise<any>;
    createReply(isMaster: boolean, message: MessageReceiveDataOptions, socket?: any): ReplyData;
}
export {};
