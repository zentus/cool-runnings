# cool-runnings
> An icey shell command runner❄

## Why?
Because Unix commands and Node are awesome, but writing logic in bash script is 🤔

## Installation

```sh
npm install cool-runnings
```

## Usage

```javascript
// myprogram.js
const { run } = require('cool-runnings')

const program = ({ arguments, flags }) => {
  const message = arguments[0]

  return {
    actions: [{
      command: message && `echo ${message} >> a-file.txt`,
      success: 'Wrote your message to a file'
		}, {
      command: flags.read && `cat a-file.txt`,
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

## License

MIT
