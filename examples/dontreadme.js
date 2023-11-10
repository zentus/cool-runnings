const { run } = require('../app') // const { run } = require('cool-runnings')

const program = (args, flags) => {
  const [message] = args

  return {
    actions: [
      () => ({
        command: message && `echo ${message} >> file.txt && echo "ok"`,
        error: 'error: Failed to write message to file',
        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,
        name: 'WriteFileAction',
        preRun: 'preRun: Will try to write message to file',
        success: 'success: Wrote message to file'
      }),
      previous => ({
        command: flags.read && 'cat file.txt',
        error: 'error: Failed to read file',
        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,
        name: 'ReadFileAction',
        onError: () => console.log('onError: Failed to read file'),
        onIgnored: ({ name }) => console.log(`onIgnored: Action "${name}" was ignored`),
        onPreRun: () => console.log('onPreRun: Will try to read file'),
        onSuccess: () => console.log(`onSuccess: Successfully read file. Previous action stdout: ${previous.stdout}`),
        onWarn: ({ code, stderr }) => console.log(`onWarn: Exited with code ${code}, but stdout was not empty: ${stderr}`),
        preRun: 'preRun: Will try to read file',
        success: `success: Successfully read file. Previous action stdout: ${previous.stdout}`,
        warn: ({ code, stderr }) => `warn: Exited with code ${code}, but stdout was not empty: ${stderr}`
      })
    ],
    options: {
      verbose: true
    }
  }
}

run(program)
