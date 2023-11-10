# cool-runnings
> An icy shell command runner ❄

## Why?
Because Unix commands and Node.js are both awesome

## Installation

```sh
npm install cool-runnings
```

## Usage

```javascript
const { run } = require('cool-runnings')

const program = () => {
  return {
    actions: [
      async () => ({
        command: 'echo "Hello!"'
      }),
      async () => ({
        command: 'echo "Hi!"'
      })
    ]
  }
}

run(program)
```

### Advanced
```javascript
const { run } = require('cool-runnings')

const program = (args, flags) => {
  const message = args[0]

  return {
    options: {
      verbose: true
    },
    actions: [
      async () => ({
        command: message && `echo ${message} >> file.txt && echo "ok"`,
        preRun: 'preRun: Will try to write message to file',
        success: 'success: Wrote message to file',
        error: 'error: Failed to write message to file',
        ignored: ({ name }) => `ignored: Action "${name}" was ignored`,
        name: 'WriteFileAction'
      }),
      async previous => ({
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
```

## Flags and args
```bash
# args[0] === "Hello there"
$ node myprogram.js "Hello there"

# flags.read === true
$ node myprogram.js --read
```

## Options
**dead**
Outputs nothing, except for stderr if exit code is not 0

**quiet**
Outputs only defined success messages, and stderr if exit code is not 0

**verbose**
Outputs everything, including debug messages

[See more examples](https://github.com/zentus/cool-runnings/tree/master/examples)

## License

MIT
