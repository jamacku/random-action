import { getInput, summary } from '@actions/core';
import { events } from './events';
import { PullRequest } from './pull-request';
import { Metadata } from './comment-metadata';
const action = (probot) => {
    probot.on(events.workflow_run, async (context) => {
        // TODO: get config
        // TODO: use zod to check if input is number string and transform to number
        const prNumber = getInput('pr', { required: true });
        const config = await context.config('random-action.yml');
        const { status, data } = await context.octokit.pulls.listCommits(context.repo({ pull_number: +prNumber }));
        if (status !== 200) {
            throw new Error('Could not get commits');
        }
        const lastCommit = data[data.length - 1];
        // TODO: set statuses as pending
        await context.octokit.repos.createCommitStatus(context.repo({
            state: 'pending',
            sha: lastCommit.sha,
            description: 'pending',
            context: 'RHEL 9 test',
            target_url: 'https://github.com/actions-private-playground/test-random-action',
        }));
        // ! This is just for DEMO purposes
        setTimeout(async () => {
            // TODO: update statuses as success or failure
            await context.octokit.repos.createCommitStatus(context.repo({
                state: 'success',
                sha: lastCommit.sha,
                description: 'All OK',
                context: 'RHEL 9 test',
                target_url: 'https://github.com/actions-private-playground/test-random-action',
            }));
            const summaryResults = summary
                .addHeading('Summary')
                .addBreak()
                .addTable([
                [
                    { data: 'File', header: true },
                    { data: 'Result', header: true },
                ],
                ['foo.js', 'Pass '],
                ['bar.js', 'Fail '],
                ['test.js', 'Pass '],
            ])
                .addLink('View staging deployment!', 'https://github.com');
            summaryResults.write();
            const stringSummary = summaryResults.stringify();
            const pr = await new PullRequest(+prNumber, await Metadata.getMetadata(+prNumber, context)).publishComment(`${stringSummary}\n---\nConfig:\n` + JSON.stringify(config, null, 2), context);
        }, 7000);
    });
};
export default action;
//# sourceMappingURL=action.js.map