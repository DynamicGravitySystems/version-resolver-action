const github = require('@actions/github')
const core = require('@actions/core')


async function main() {
    try {
        core.info('Attempting to resolve tags and version')

        const githubToken = core.getInput('github_token')
        const octokit = github.getOctokit(githubToken)
        const { data: tags } = await octokit.rest.git.getRef({
            ...github.context.repo,
            ref: 'tags'
        });

        core.info(JSON.stringify(tags))

        core.setOutput('version', '1.0.0')

    } catch (error) {
        core.error(JSON.stringify(error))
        core.setFailed(error.message)
    }
}

main();