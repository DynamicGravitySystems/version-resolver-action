const core = require('@actions/core')
const github = require('@actions/github')


try {

    const githubToken = core.getInput('github_token')
    const octokit = github.getOctokit(githubToken)
    const { data: tags } = await octokit.rest.git.getRef({
        ...github.context.repo,
        ref: 'tags'
    });


    core.info(JSON.stringify(tags))

    core.setOutput('version', '1.0.0')

} catch (error) {
    core.setFailed(error.message)
}
