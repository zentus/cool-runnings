const shell = require('shell-exec')
const minimist = require('minimist')
const waterfall = require('p-waterfall')
const { log, error } = console

// Flags
// -d, dead
// Outputs only stderr if exit code is not 0

// -q, quiet
// Outputs only defined success messages, and stderr if exit code is not 0

// Get CLI input
const getInput = process => {
	const { _: arguments, ...flags } = minimist(process.argv.slice(2))
	return { arguments, flags }
}

// Handle shell command
const handle = (action, options) => shell(action.command)
	.then(result => {

		const {stdout, stderr, code} = result
		const { flags } = getInput(process)

		if (code !== 0 && stderr) {
			if (!flags.d && action.error) log(action.error)
			throw new Error(stderr)
		}

		if (code === 0 && stderr) {
			if (!flags.d && !flags.q) log(stderr)
			if (!flags.d && action.warn) log(action.warn)
			return result
		}

		if (code !== 0) {
			throw `Command '${action.command}' returned exit code: ${code}.`
		}

		if (!flags.d && !flags.q && stdout) log(stdout)
		if (!flags.d && action.success) log(action.success)

		return result
	})


// Creates an action queue using program object
const createQueue = program => {
	return program.actions
		.filter(action => action.command)
		.map(action => {
			return () => handle(action, program.options)
		})
}

// Get command line arguments and flags
// Use programCreator to create program object
// Create and start the action queue
const run = programCreator => {
	const input = getInput(process)
	const program = programCreator(input)
	const queue = createQueue(program)

	waterfall(queue)
		.then(result => {
			// const lastCommand = {
			// 	action: program.actions.find(action => action.command === cmd),
			// 	result
			// }
		})
		.catch(err => error(err))
}

module.exports = { getInput, run }
