import { Context, Probot } from 'probot';
import { getInput, summary } from '@actions/core';

import { events } from './events';

const action = (probot: Probot) => {
  probot.on(
    events.workflow_run,
    async (context: Context<(typeof events.workflow_run)[number]>) => {
      // TODO: get config
      // TODO: use zod to check if input is number string and transform to number
      const prNumber = getInput('pr', { required: true });

      const { status, data } = await context.octokit.pulls.listCommits(
        context.repo({ pull_number: +prNumber })
      );

      if (status !== 200) {
        throw new Error('Could not get commits');
      }

      const lastCommit = data[data.length - 1];

      // TODO: set statuses as pending
      await context.octokit.repos.createCommitStatus(
        context.repo({
          state: 'error',
          sha: lastCommit.sha,
          description: 'description',
          target_url: 'url',
        })
      );

      // TODO: update statuses as success or failure

      summary
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
        .addLink('View staging deployment!', 'https://github.com')
        .write();

      await context.octokit.issues.createComment(
        context.repo({
          issue_number: +prNumber,
          body: 'Hello World!',
        })
      );
    }
  );
};

export default action;
