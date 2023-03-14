export class Metadata {
    constructor(issueNumber, metadata) {
        var _a;
        this.issueNumber = issueNumber;
        this._commentID = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.commentID) !== null && _a !== void 0 ? _a : undefined;
    }
    get commentID() {
        return this._commentID;
    }
    set commentID(value) {
        if (this._commentID === undefined) {
            this._commentID = value;
        }
    }
    async setMetadata(context) {
        var _a;
        if (this.commentID !== undefined) {
            await MetadataController.setMetadata(Metadata.metadataCommentID, (_a = this.commentID) !== null && _a !== void 0 ? _a : '', context, this.issueNumber);
        }
    }
    static async getMetadata(issueNumber, context) {
        return new Metadata(issueNumber, {
            commentID: await MetadataController.getMetadata(issueNumber, Metadata.metadataCommentID.toString(), context),
        });
    }
}
Metadata.metadataCommentID = 'comment-id';
/**
 * Based on probot-metadata - https://github.com/probot/metadata
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MetadataController {
    static async getMetadata(issueNumber, key, context) {
        const body = (await context.octokit.issues.get(context.issue({ issue_number: issueNumber }))).data.body || '';
        const match = body.match(MetadataController.regex);
        if (match) {
            const data = JSON.parse(match[1]);
            return key ? data && data[key] : data;
        }
    }
    static async setMetadata(key, value, context, issueNumber) {
        let body = (await context.octokit.issues.get(context.issue(issueNumber ? { issue_number: issueNumber } : {}))).data.body || '';
        let data = {};
        body = body.replace(MetadataController.regex, (_, json) => {
            data = JSON.parse(json);
            return '';
        });
        if (!data)
            data = {};
        if (typeof key === 'object') {
            Object.assign(data, key);
        }
        else {
            data[key] = value;
        }
        return context.octokit.issues.update(context.issue(Object.assign({ body: `${body}\n\n<!-- random-action = ${JSON.stringify(data)} -->` }, (issueNumber ? { issue_number: issueNumber } : {}))));
    }
}
MetadataController.regex = /\n\n<!-- random-action = (.*) -->/;
//# sourceMappingURL=comment-metadata.js.map