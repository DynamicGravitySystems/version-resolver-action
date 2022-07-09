const github = require('@actions/github')
const core = require('@actions/core')


async function main() {
    try {
        core.info('Attempting to resolve tags and version')

        const githubToken = core.getInput('github_token')
        const octokit = github.getOctokit(githubToken)
        // const rep1 = await octokit.rest.git.listMatchingRefs({
        //     ...github.context.repo,
        //     ref: 'tags'
        // });

        const reply = await octokit.request('GET /repos/{owner}/{repo}/tags', {
            ...github.context.repo,
            per_page: 100
        })

        // core.info(JSON.stringify(rep1))
        core.info(JSON.stringify(reply))

        core.setOutput('version', '1.0.0')

    } catch (error) {
        core.error(JSON.stringify(error))
        core.setFailed(error.message)
    }
}

main();