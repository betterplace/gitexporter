async function addGitRepoCommit (folder, repoPath, data, timeIndex, message, { chmod = null, mode = 'file' } = {}) {
    const to60num = (x) => `${('' + (x % 60 - x % 10)).substring(0, 1)}${x % 10}`
    await exec(`mkdir -p ${path.dirname(path.join(folder, repoPath))}`)
    if (mode === 'file') {
        await writeFileAtomic(path.join(folder, repoPath), data)
    } else if (mode === 'link') {
        await exec(`ln -s ${data} ${path.join(folder, repoPath)}`)
    } else {
        throw new Error('addGitRepoCommit(): unknown file mode')
    }
    if (chmod) await exec(`chmod ${chmod} ${path.join(folder, repoPath)}`)
    await exec(`git -C ${folder} add ${repoPath}`)
    const commiterDate = `2010-01-01T22:${to60num(timeIndex)}:00Z`
    const commiterName = `Name2`
    const commiterEmail = `user2@example.com`
    const authorDate = `2005-${to60num(timeIndex + 4)}-07T${(timeIndex === 0) ? 22 : 23}:13:13Z`
    const authorName = `User`
    const authorEmail = `user@example.com`
    await exec(`GIT_COMMITTER_DATE="${commiterDate}" git -C ${folder} -c user.name="${commiterName}" -c user.email=${commiterEmail} commit --author='${authorName} <${authorEmail}>' --date "${authorDate}" -am '${message}'`)
}

    await addGitRepoCommit(folder, filename, text1, 0, 'initial commit')
    await addGitRepoCommit(folder, filename, text2, 1, 'change initial text')
    await addGitRepoCommit(folder, renamedFilename, text2, 2, 'rename file')
    await addGitRepoCommit(folder, `${renamedFilename}.link`, renamedFilename, 3, 'create link', { mode: 'link' })
    await addGitRepoCommit(folder, 'sTest.txt', text1, 4, 'another file')
    await addGitRepoCommit(folder, path.join('bin', 'script.js'), '#!/usr/bin/env node\nconsole.log(911)\n', 5, 'add script!', { chmod: '+x' })
test('gitexporter save git history', async () => {
    const folder = 'ignore.save-history'
    const config = `{
  "forceReCreateRepo": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}"
}`
    await run(`rm -rf ${folder}*`)
    await prepareGitRepo(`${folder}`)
    await writeFileAtomic(`${folder}.config.json`, config)
    await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`)

    const logs = JSON.parse(fs.readFileSync(`${folder}-target.log.json`, { encoding: 'utf-8' }))
    expect(logs.paths).toEqual([
        'test.txt',
        'Test.txt',
        'Test.txt.link',
        'sTest.txt',
        'bin/script.js',
    ])
    expect(logs.ignoredPaths).toEqual([])
    expect(logs.skippedPaths).toEqual([])
    expect(logs.allowedPaths).toEqual([
        'test.txt',
        'Test.txt',
        'Test.txt.link',
        'sTest.txt',
        'bin/script.js',
    ])

    await run(`git -C ${folder}-target log -p`, DEFAULT_PREPARE_GIT_REPO_HISTORY)
})

    expect(logs.skippedPaths).toEqual([
        'Test.txt.link',
        'sTest.txt',
        'bin/script.js',
    ])
        'commit 867aa676ef2a4d5de5756a53dbff77d4a726e3e9',
        'commit 427f8e83a1658852b8c6f4be99b4664976746aab',
        'commit f44ba5da1dae5ced415f214f92ec0ba3e4d25a20',
        'commit ee01df4e6cc73e4210e87c94b853a96103ca02c2',
        'diff --git a/test.txt b/Test.txt',
        'similarity index 100%',
        'rename from test.txt',
        'rename to Test.txt',
    expect(logs.skippedPaths).toEqual([])
    expect(logs.skippedPaths).toEqual([
        'Test.txt.link',
    ])

function expectStdout (data, contains = null, notContains = null) {
    expect(data).toHaveProperty('stdout')
    if (contains && contains.length) {
        for (const c of contains) {
            expect(data.stdout).toContain(c)
        }
    }
    if (notContains && notContains.length) {
        for (const c of notContains) {
            expect(data.stdout).not.toContain(c)
        }
    }
}

test('gitexporter follow by logfile', async () => {
    const folder = 'ignore.follow-by-logfile'
    const config = `{
  "forceReCreateRepo": false,
  "followByLogFile": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "ignoredPaths": ["sTest.txt", "*.link"],
  "allowedPaths": ["*"]
}`

    await run(`rm -rf ${folder}*`)
    await prepareGitRepo(`${folder}`)
    await writeFileAtomic(`${folder}.config.json`, config)
    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish'],
        ['Follow target repo state', 'Follow log stopped'],
    )

    await addGitRepoCommit(folder, 'some-file.txt', 'hollo world!', 6, 'add hollo')

    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 6 commits', 'Follow log stopped! last commit 7/7 46c01f27346ad1e77ffcc81e38b914ea17ae0395'],
    )

    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 7 commits', 'Follow log stopped! last commit 7 95655d5bd61e5d8c71acde522f28c0d46fb17330'],
    )
    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 7 commits', 'Follow log stopped! last commit 7 95655d5bd61e5d8c71acde522f28c0d46fb17330'],
    )
    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 7 commits', 'Follow log stopped! last commit 7 95655d5bd61e5d8c71acde522f28c0d46fb17330'],
    )

    await run(`git -C ${folder}-target log -p`, [
        'commit 95655d5bd61e5d8c71acde522f28c0d46fb17330',
        'Author: User <user@example.com>',
        'Date:   Fri Oct 7 23:13:13 2005 +0000',
        'add hollo',
        'diff --git a/some-file.txt b/some-file.txt',
        'new file mode 100644',
        'index 0000000..ff0d2a6',
        '--- /dev/null',
        '+++ b/some-file.txt',
        '@@ -0,0 +1 @@',
        '+hollo world!',
        '\\ No newline at end of file',
        'commit 46c01f27346ad1e77ffcc81e38b914ea17ae0395',
        'Author: User <user@example.com>',
        'Date:   Wed Sep 7 23:13:13 2005 +0000',
        'add script!',
        'diff --git a/bin/script.js b/bin/script.js',
        'new file mode 100755',
        'index 0000000..ca29b27',
        '--- /dev/null',
        '+++ b/bin/script.js',
        '@@ -0,0 +1,2 @@',
        '+#!/usr/bin/env node',
        '+console.log(911)',
        'commit 427f8e83a1658852b8c6f4be99b4664976746aab',
        'Author: User <user@example.com>',
        'Date:   Sun Aug 7 23:13:13 2005 +0000',
        'another file',
        'commit f44ba5da1dae5ced415f214f92ec0ba3e4d25a20',
        'Author: User <user@example.com>',
        'Date:   Thu Jul 7 23:13:13 2005 +0000',
        'create link',
        'commit ee01df4e6cc73e4210e87c94b853a96103ca02c2',
        'Author: User <user@example.com>',
        'Date:   Tue Jun 7 23:13:13 2005 +0000',
        'rename file',
        'diff --git a/test.txt b/Test.txt',
        'similarity index 100%',
        'rename from test.txt',
        'rename to Test.txt',
        'commit d0dc86bea4f548db93905b71da1c6915594bfd5b',
        'Author: User <user@example.com>',
        'Date:   Sat May 7 23:13:13 2005 +0000',
        'change initial text',
        'diff --git a/test.txt b/test.txt',
        'index 6dbb898..41c4a21 100644',
        '--- a/test.txt',
        '+++ b/test.txt',
        '@@ -1 +1 @@',
        '-Initial text',
        '\\ No newline at end of file',
        '+Changed text',
        '\\ No newline at end of file',
        'commit c731fd997376f68806c5cbe100edc7000acb75db',
        'Author: User <user@example.com>',
        'Date:   Thu Apr 7 22:13:13 2005 +0000',
        'initial commit',
        'diff --git a/test.txt b/test.txt',
        'new file mode 100644',
        'index 0000000..6dbb898',
        '--- /dev/null',
        '+++ b/test.txt',
        '@@ -0,0 +1 @@',
        '+Initial text',
        '\\ No newline at end of file',
    ])
})

test('gitexporter commitTransformer', async () => {
    const folder = 'ignore.commit-transformer'
    const config = `{
  "forceReCreateRepo": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "commitTransformer": "./${folder}.transformer.js",
  "allowedPaths": ["*"]
}`
    const transformer = `
    module.exports = function (commit, files) {
        commit.message = 'XXX: ' + commit.message
    }
    `

    await run(`rm -rf ${folder}*`)
    await prepareGitRepo(`${folder}`)
    await writeFileAtomic(`${folder}.config.json`, config)
    await writeFileAtomic(`${folder}.transformer.js`, transformer)
    await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`)

    await run(`git -C ${folder}-target log -p`, [
        'commit a5eb28f672bd8c801088c16da026d3cef8c2c5dd',
        'Author: User <user@example.com>',
        'Date:   Wed Sep 7 23:13:13 2005 +0000',
        'XXX: add script!',
        'diff --git a/bin/script.js b/bin/script.js',
        'new file mode 100755',
        'index 0000000..ca29b27',
        '--- /dev/null',
        '+++ b/bin/script.js',
        '@@ -0,0 +1,2 @@',
        '+#!/usr/bin/env node',
        '+console.log(911)',
        'commit b5d8d9a675509efabd89348aceef6cffff809a75',
        'Author: User <user@example.com>',
        'Date:   Sun Aug 7 23:13:13 2005 +0000',
        'XXX: another file',
        'diff --git a/sTest.txt b/sTest.txt',
        'new file mode 100644',
        'index 0000000..6dbb898',
        '--- /dev/null',
        '+++ b/sTest.txt',
        '@@ -0,0 +1 @@',
        '+Initial text',
        '\\ No newline at end of file',
        'commit 737d203709702b8b1670beb3e001a7511db3089c',
        'Author: User <user@example.com>',
        'Date:   Thu Jul 7 23:13:13 2005 +0000',
        'XXX: create link',
        'diff --git a/Test.txt.link b/Test.txt.link',
        'new file mode 120000',
        'index 0000000..d7da186',
        '--- /dev/null',
        '+++ b/Test.txt.link',
        '@@ -0,0 +1 @@',
        '+Test.txt',
        '\\ No newline at end of file',
        'commit 5be2808ce613d73bbcc570931dbb9b71b36c13fa',
        'Author: User <user@example.com>',
        'Date:   Tue Jun 7 23:13:13 2005 +0000',
        'XXX: rename file',
        'diff --git a/test.txt b/Test.txt',
        'similarity index 100%',
        'rename from test.txt',
        'rename to Test.txt',
        'commit bcc480d7ff93cbfab7808289bce89e8c442f801d',
        'Author: User <user@example.com>',
        'Date:   Sat May 7 23:13:13 2005 +0000',
        'XXX: change initial text',
        'diff --git a/test.txt b/test.txt',
        'index 6dbb898..41c4a21 100644',
        '--- a/test.txt',
        '+++ b/test.txt',
        '@@ -1 +1 @@',
        '-Initial text',
        '\\ No newline at end of file',
        '+Changed text',
        '\\ No newline at end of file',
        'commit 918eea168bf7ea3d29c71ea841e4c2e64ee9e35f',
        'Author: User <user@example.com>',
        'Date:   Thu Apr 7 22:13:13 2005 +0000',
        'XXX: initial commit',
        'diff --git a/test.txt b/test.txt',
        'new file mode 100644',
        'index 0000000..6dbb898',
        '--- /dev/null',
        '+++ b/test.txt',
        '@@ -0,0 +1 @@',
        '+Initial text',
        '\\ No newline at end of file',
    ])
})

test('gitexporter syncAllFilesOnLastFollowCommit: true', async () => {
    const folder = 'ignore.sync-tree'
    const config1 = `{
  "forceReCreateRepo": false,
  "syncAllFilesOnLastFollowCommit": true,
  "followByLogFile": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "ignoredPaths": ["test.txt", "*.link"],
  "allowedPaths": ["*"]
}`

    await run(`rm -rf ${folder}*`)
    await prepareGitRepo(`${folder}`)
    await writeFileAtomic(`${folder}.config.json`, config1)
    await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`)

    const config2 = `{
  "forceReCreateRepo": false,
  "syncAllFilesOnLastFollowCommit": true,
  "followByLogFile": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "allowedPaths": ["*"]
}`
    await writeFileAtomic(`${folder}.config.json`, config2)
    await addGitRepoCommit(folder, 'some-file.txt', 'hollo world!', 6, 'add hollo')
    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 6 commits', 'Follow log stopped! last commit 7/7 449f22bdf5add1e83d1a30d50afa924c23cbe5ac'],
    )

    await run(`git -C ${folder}-target log -p`, [
        'commit 61d9922a45251600a04ed4d5f082610f21cdd107',
        'Author: User <user@example.com>',
        'Date:   Fri Oct 7 23:13:13 2005 +0000',
        'add hollo',
        'diff --git a/Test.txt b/Test.txt',
        'new file mode 100644',
        'index 0000000..41c4a21',
        '--- /dev/null',
        '+++ b/Test.txt',
        '@@ -0,0 +1 @@',
        '+Changed text',
        '\\ No newline at end of file',
        'diff --git a/some-file.txt b/some-file.txt',
        'new file mode 100644',
        'index 0000000..ff0d2a6',
        '--- /dev/null',
        '+++ b/some-file.txt',
        '@@ -0,0 +1 @@',
        '+hollo world!',
        '\\ No newline at end of file',
        'commit 449f22bdf5add1e83d1a30d50afa924c23cbe5ac',
        'Author: User <user@example.com>',
        'Date:   Wed Sep 7 23:13:13 2005 +0000',
        'add script!',
        'diff --git a/bin/script.js b/bin/script.js',
        'new file mode 100755',
        'index 0000000..ca29b27',
        '--- /dev/null',
        '+++ b/bin/script.js',
        '@@ -0,0 +1,2 @@',
        '+#!/usr/bin/env node',
        '+console.log(911)',
        'commit 3abcc91755c2232f1a481ad330a419d7820f8a0c',
        'Author: User <user@example.com>',
        'Date:   Sun Aug 7 23:13:13 2005 +0000',
        'another file',
        'diff --git a/sTest.txt b/sTest.txt',
        'new file mode 100644',
        'index 0000000..6dbb898',
        '--- /dev/null',
        '+++ b/sTest.txt',
        '@@ -0,0 +1 @@',
        '+Initial text',
        '\\ No newline at end of file',
        'commit d6f6abe8b06b56013246276299a9671213671ee0',
        'Author: User <user@example.com>',
        'Date:   Thu Jul 7 23:13:13 2005 +0000',
        'create link',
        'commit f995e7171c59eca6d1c664cfa4b074a117109cf5',
        'Author: User <user@example.com>',
        'Date:   Tue Jun 7 23:13:13 2005 +0000',
        'rename file',
        'commit 8e4da0cc03de0ae8f434a878a00eb9d600d3de56',
        'Author: User <user@example.com>',
        'Date:   Sat May 7 23:13:13 2005 +0000',
        'change initial text',
        'commit 2ddd8f9d41399241dec8f4dce64e6365335baa1f',
        'Author: User <user@example.com>',
        'Date:   Thu Apr 7 22:13:13 2005 +0000',
        'initial commit',
    ])
})

test('gitexporter syncAllFilesOnLastFollowCommit: false', async () => {
    const folder = 'ignore.sync-tree'
    const config1 = `{
  "forceReCreateRepo": false,
  "syncAllFilesOnLastFollowCommit": false,
  "followByLogFile": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "ignoredPaths": ["test.txt", "*.link"],
  "allowedPaths": ["*"]
}`

    await run(`rm -rf ${folder}*`)
    await prepareGitRepo(`${folder}`)
    await writeFileAtomic(`${folder}.config.json`, config1)
    await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`)

    const config2 = `{
  "forceReCreateRepo": false,
  "syncAllFilesOnLastFollowCommit": false,
  "followByLogFile": true,
  "targetRepoPath": "${folder}-target",
  "sourceRepoPath": "${folder}",
  "allowedPaths": ["*"]
}`
    await writeFileAtomic(`${folder}.config.json`, config2)
    await addGitRepoCommit(folder, 'some-file.txt', 'hollo world!', 6, 'add hollo')
    expectStdout(
        await run(`node --unhandled-rejections=strict index.js ${folder}.config.json`),
        ['Finish', 'Follow target repo state by log file: 6 commits', 'Follow log stopped! last commit 7/7 449f22bdf5add1e83d1a30d50afa924c23cbe5ac'],
    )

    await run(`git -C ${folder}-target log -p`, [
        'commit b069f0fcd71c14ff76d60a9a64c04a1d8b1c2472',
        'Author: User <user@example.com>',
        'Date:   Fri Oct 7 23:13:13 2005 +0000',
        'add hollo',
        'diff --git a/some-file.txt b/some-file.txt',
        'new file mode 100644',
        'index 0000000..ff0d2a6',
        '--- /dev/null',
        '+++ b/some-file.txt',
        '@@ -0,0 +1 @@',
        '+hollo world!',
        '\\ No newline at end of file',
        'commit 449f22bdf5add1e83d1a30d50afa924c23cbe5ac',
        'Author: User <user@example.com>',
        'Date:   Wed Sep 7 23:13:13 2005 +0000',
        'add script!',
        'diff --git a/bin/script.js b/bin/script.js',
        'new file mode 100755',
        'index 0000000..ca29b27',
        '--- /dev/null',
        '+++ b/bin/script.js',
        '@@ -0,0 +1,2 @@',
        '+#!/usr/bin/env node',
        '+console.log(911)',
        'commit 3abcc91755c2232f1a481ad330a419d7820f8a0c',
        'Author: User <user@example.com>',
        'Date:   Sun Aug 7 23:13:13 2005 +0000',
        'another file',
        'diff --git a/sTest.txt b/sTest.txt',
        'new file mode 100644',
        'index 0000000..6dbb898',
        '--- /dev/null',
        '+++ b/sTest.txt',
        '@@ -0,0 +1 @@',
        '+Initial text',
        '\\ No newline at end of file',
        'commit d6f6abe8b06b56013246276299a9671213671ee0',
        'Author: User <user@example.com>',
        'Date:   Thu Jul 7 23:13:13 2005 +0000',
        'create link',
        'commit f995e7171c59eca6d1c664cfa4b074a117109cf5',
        'Author: User <user@example.com>',
        'Date:   Tue Jun 7 23:13:13 2005 +0000',
        'rename file',
        'commit 8e4da0cc03de0ae8f434a878a00eb9d600d3de56',
        'Author: User <user@example.com>',
        'Date:   Sat May 7 23:13:13 2005 +0000',
        'change initial text',
        'commit 2ddd8f9d41399241dec8f4dce64e6365335baa1f',
        'Author: User <user@example.com>',
        'Date:   Thu Apr 7 22:13:13 2005 +0000',
        'initial commit',
    ])
})