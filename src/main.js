const github = require('@actions/github')
const core = require('@actions/core')


async function run() {
    try {
        core.info('Attempting to resolve tags and version')

        const githubToken = core.getInput('github_token')
        const octokit = github.getOctokit(githubToken)
        // const rep1 = await octokit.rest.git.listMatchingRefs({
        //     ...github.context.repo,
        //     ref: 'tags'
        // });

        const {data: tags} = await octokit.request('GET /repos/{owner}/{repo}/tags', {
            ...github.context.repo,
            per_page: 100
        })

        if (tags.size === 0) {
            core.info("No tags found for repo, returning default version 1.0.0")

            core.setOutput('version', '1.0.0')
        } else {
            let maj = 0
            let min = 0
            let patch = 0

            tags.map(t => {
                return t.name.replace("v", "")
            }).forEach(t => {
                console.log(`version: ${t}`)

                let parts = t.split('\.').map(parseInt)
                console.log(`Parts: ${JSON.stringify(parts)}`)

                let a = parts.shift()
                let b = parts.shift()
                let c = parts.shift()

                if (a !== undefined && a > maj) {
                    maj = a
                    min = b !== undefined ? b : 0
                    patch = c !== undefined ? c : 0
                    return
                }

                if (b !== undefined && b > min) {
                    min = b
                    patch = c !== undefined ? c : 0
                    return
                }

                if (c !== undefined && c > patch) {
                    patch = c
                }

            })

            console.log(`Resolved highest version ${maj}.${min}.${patch}`)
        }

        // core.info(JSON.stringify(rep1))
        core.info(JSON.stringify(tags))


    } catch (error) {
        core.error(JSON.stringify(error))
        core.setFailed(error.message)
    }
}

run();