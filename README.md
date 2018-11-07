# cool-runnings
> An icey shell command runner ❄

## Why?
Because Unix commands and Node are awesome, but writing logic in bash script is 🤔

## Installation

```sh
npm install cool-runnings
```

## Usage
```javascript
// minimal.js
const { run } = require('cool-runnings')

const program = [
  'echo "Whats up?"',
  'echo "Not much, how about you?"'
]

run(program)
```

```bash
$ node minimal.js
# => Whats up?
# => Not much, how about you?
```

You can also run it with flags and arguments
```javascript
// myprogram.js
const { run } = require('cool-runnings')

const program = (args, flags) => {
  const message = args[0]

  return {
    actions: [{
      command: message && `echo ${message} >> file.txt`,
      success: 'Wrote your message to file'
    }, {
      command: flags.read && `cat file.txt`,
      success: 'Successfully read file'
    }]
  }
}

run(program)
```

Then run it like:
```bash
$ node myprogram.js "Hello there"
# => Wrote your message to a file

$ node myprogram.js --read
# => Hello there
# => Successfully read file
```

[See more examples](https://github.com/zentus/cool-runnings/tree/master/examples)

## License

MIT
