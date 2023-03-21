import { getInput, summary } from '@actions/core';
import { events } from './events';
import { PullRequest } from './pull-request';
import { Metadata } from './comment-metadata';
import { configSchema, inputPullRequestNumberSchema } from './schema';
const action = (probot) => {
    probot.on(events.workflow_run, async (context) => {
        const prNumber = inputPullRequestNumberSchema.parse(getInput('pr', { required: true }));
        const config = configSchema.parse(await context.config('random-action.yml'));
        const { status, data } = await context.octokit.pulls.listCommits(context.repo({ pull_number: prNumber }));
        if (status !== 200) {
            throw new Error('Could not get commits');
        }
        const lastCommit = data[data.length - 1];
        for (const matrix of config.matrix) {
            for (const version of matrix.version) {
                for (const os of matrix.os_test) {
                    for (const testCase of matrix.test_case) {
                        await context.octokit.repos.createCommitStatus(context.repo({
                            state: 'pending',
                            sha: lastCommit.sha,
                            description: 'Test has started',
                            context: `${os} - v${version} - test ${testCase}`,
                            target_url: 'https://github.com/actions-private-playground/test-random-action',
                        }));
                    }
                }
            }
        }
        let summaryResults = summary.addHeading('Summary').addBreak();
        const results = [];
        // ! This is just for DEMO purposes
        setTimeout(async () => {
            for (const matrix of config.matrix) {
                for (const version of matrix.version) {
                    for (const os of matrix.os_test) {
                        for (const testCase of matrix.test_case) {
                            const { state, description } = Math.random() > 0.5
                                ? { state: 'success', description: 'All OK' }
                                : {
                                    state: 'failure',
                                    description: 'Something went wrong',
                                };
                            results.push([`${os} - v${version} - test ${testCase}`, state]);
                            await context.octokit.repos.createCommitStatus(context.repo({
                                state,
                                sha: lastCommit.sha,
                                description: description,
                                context: `${os} - v${version} - test ${testCase}`,
                                target_url: 'https://github.com/actions-private-playground/test-random-action',
                            }));
                        }
                    }
                }
            }
            summaryResults = summaryResults.addTable([
                [
                    { data: 'Test', header: true },
                    { data: 'Result', header: true },
                ],
                ...results,
            ]);
            summaryResults.write();
            const stringSummary = summaryResults.stringify();
            const pr = await new PullRequest(prNumber, await Metadata.getMetadata(prNumber, context)).publishComment(`${stringSummary}\n---\nConfig:\n` + JSON.stringify(config, null, 2), context);
        }, 7000);
    });
};
export default action;
//# sourceMappingURL=action.js.map