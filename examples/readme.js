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

      // ## Action
      // An action must be a function.

      // ## Previous
      // The action function recieves an object containing properties 'stdout', 'stderr', 'code', 'ignored' and 'name'
      // for the previous action.
      // If ignored === true, it means the previous action was omitted because the value of the 'command' property was falsy.
      previous => ({
        // ## Unix command
        // Command will be omitted if this value is undefined.
        command: flags.read && 'cat file.txt',

        error: 'error: Failed to read file',

        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,

        // For debugging. Defaults to action index.
        name: 'ReadFileAction',

        onError: () => console.log('onError: Failed to read file'),

        onIgnored: ({ name }) => console.log(`onIgnored: Action "${name}" was ignored`),

        // ## Function hooks
        // Recieves an object containing keys 'stdout', 'stderr', 'code' and 'ignored'.
        onPreRun: () => console.log('onPreRun: Will try to read file'),

        onSuccess: () => console.log(`onSuccess: Successfully read file. Previous action stdout: ${previous.stdout}`),

        onWarn: ({ code, stderr }) => console.log(`onWarn: Exited with code ${code}, but stdout was not empty: ${stderr}`),
        // ## Log hooks
        // Can be either a string or a function.
        // Functions recieve an object containing keys 'stdout', 'stderr', 'code', 'ignored' and 'name'.
        preRun: 'preRun: Will try to read file',
        success: `success: Successfully read file. Previous action stdout: ${previous.stdout}`,
        warn: ({ code, stderr }) => `warn: Exited with code ${code}, but stdout was not empty: ${stderr}`
      })
    ],
    options: {
      // quiet: true
      // dead: true
      // verbose: true
    }
  }
}

run(program)

// Write to file
// $ node readme.js hello

// Write to file and read from file
// $ node readme.js hello --read

// Read from file
// $ node readme.js --read

// Do nothing
// $ node readme.js
