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
        const releaseType = core.getInput('semantic_release')

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
                let parts = t.split('\.').map(it => {
                    return parseInt(String(it));
                })

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
            if(releaseType === 'major') {
                maj++
            } else if (releaseType === 'patch') {
                patch++
            } else {
                min++;
            }

            core.setOutput('version', `${maj}.${min}.${patch}`)
        }

    } catch (error) {
        core.error(JSON.stringify(error))
        core.setFailed(error.message)
    }
}

run();