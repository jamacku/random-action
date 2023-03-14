import { Context } from 'probot';
import { events } from './events';
import { Metadata } from './comment-metadata';
export declare class PullRequest {
    readonly id: number;
    private _metadata;
    constructor(id: number, metadata: Metadata);
    get metadata(): Metadata;
    publishComment(content: string, context: {
        [K in keyof typeof events]: Context<(typeof events)[K][number]>;
    }[keyof typeof events]): Promise<void>;
    private createComment;
    private updateComment;
}
