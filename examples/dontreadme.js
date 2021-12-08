const { run } = require('../app') // const { run } = require('cool-runnings')

const program = (args, flags) => {
  const message = args[0]

  return {
    options: {
      verbose: true
    },
    actions: [
      () => ({
        command: message && `echo ${message} >> file.txt && echo "ok"`,
        preRun: 'preRun: Will try to write message to file',
        success: 'success: Wrote message to file',
        error: 'error: Failed to write message to file',
        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,
        name: 'WriteFileAction'
      }),
      previous => ({
        command: flags.read && 'cat file.txt',
        name: 'ReadFileAction',
        preRun: 'preRun: Will try to read file',
        success: `success: Successfully read file. Previous action stdout: ${previous.stdout}`,
        error: 'error: Failed to read file',
        warn: ({ code, stderr }) => `warn: Exited with code ${code}, but stdout was not empty: ${stderr}`,
        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,
        onPreRun: () => console.log('onPreRun: Will try to read file'),
        onSuccess: () => console.log(`onSuccess: Successfully read file. Previous action stdout: ${previous.stdout}`),
        onError: () => console.log('onError: Failed to read file'),
        onWarn: ({ stderr, code }) => console.log(`onWarn: Exited with code ${code}, but stdout was not empty: ${stderr}`),
        onIgnored: ({ name }) => console.log(`onIgnored: Action "${name}" was ignored`)
      })
    ]
  }
}

run(program)
