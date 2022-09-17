const github = require('@actions/github')
const core = require('@actions/core')

const major = /^(maj(or)?)|(breaking)/
const minor = /^(minor|feature)/

function resolveType(message) {
    if (major.test(message)) {
        return 'major'
    }
    if (minor.test(message)) {
        return 'minor'
    }

    return 'patch'
}

async function getTags(page = 1) {
    const githubToken = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(githubToken)

    const {data: tags} = await octokit.request('GET /repos/{owner}/{repo}/tags', {
        ...github.context.repo,
        accept: 'application/vnd.github+json',
        per_page: 100,
        page: page
    })

    if (tags.size >= 100) {
        return tags.concat(await getTags(page + 1))
    } else {
        return tags
    }
}

async function run() {
    try {
        core.info('Attempting to resolve tags and version')

        const tags = await getTags()

        let releaseType = core.getInput('release_type');
        if (releaseType === '' ) {
            releaseType = resolveType(core.getInput('message'))
        }

        if (tags.size === 0) {
            const initVersion = core.getInput('init_version')
            let ver = initVersion === '' ? '1.0.0' : initVersion
            core.debug(`No tags found for repo, returning default version ${ver}`)

            core.setOutput('version', ver)
        } else {
            let maj = 0
            let min = 0
            let patch = 0

            tags.map(t => t.name.replace("v", ""))
                .forEach(t => {
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

            core.info(`Resolved highest version ${maj}.${min}.${patch}`)
            if (releaseType === 'major') {
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