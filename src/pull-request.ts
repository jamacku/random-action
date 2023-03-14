import { warning } from '@actions/core';
import { Context } from 'probot';

import { events } from './events';
import { Metadata } from './comment-metadata';

export class PullRequest {
  private _metadata: Metadata;

  constructor(readonly id: number, metadata: Metadata) {
    this._metadata = metadata;
  }

  get metadata() {
    return this._metadata;
  }

  async publishComment(
    content: string,
    context: {
      [K in keyof typeof events]: Context<(typeof events)[K][number]>;
    }[keyof typeof events]
  ) {
    if (this.metadata.commentID) {
      this.updateComment(content, context);
      return;
    }

    const commentPayload = (await this.createComment(content, context))?.data;

    if (!commentPayload) {
      warning(`Failed to create comment.`);
      return;
    }

    this.metadata.commentID =
      commentPayload.id === undefined
        ? commentPayload.id
        : commentPayload.id.toString();
    await this.metadata.setMetadata(context);
  }

  private async createComment(
    body: string,
    context: {
      [K in keyof typeof events]: Context<(typeof events)[K][number]>;
    }[keyof typeof events]
  ) {
    if (!body || body === '') return;

    return context.octokit.issues.createComment(
      context.issue({
        issue_number: this.id,
        body,
      })
    );
  }

  private async updateComment(
    body: string,
    context: {
      [K in keyof typeof events]: Context<(typeof events)[K][number]>;
    }[keyof typeof events]
  ) {
    if (!this.metadata.commentID) return;

    return context.octokit.issues.updateComment(
      context.issue({
        comment_id: +this.metadata.commentID,
        body,
      })
    );
  }
}
