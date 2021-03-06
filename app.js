const shell = require('shell-exec')
const minimist = require('minimist')
const waterfall = require('p-waterfall')
const { log, error } = console
const { isArray } = Array

// Flags
// -d, dead
// Outputs nothing but stderr if exit code !== 0

// -q, quiet
// Outputs only defined success messages, and stderr if exit code !== 0

// Get command line input
const getInput = process => {
  const { _: args, ...flags } = minimist(process.argv.slice(2))
  return { args, flags }
}

// Handle shell command
const handle = (action, options, preRunPromise) => preRunPromise.then(preRun => {
	if (preRun) {
		log(preRun)
	}

	if (action.onPreRun && typeof action.onPreRun === 'function') {
		action.onPreRun(action)
	}

	return shell(action.command)
		.then(result => {
			const { stdout, stderr, code } = result
			const { flags } = getInput(process)

			if (options.quiet) {
				flags.q = true
			}

			if (options.dead) {
				flags.d = true
			}

			if (code !== 0 && stderr) {
				if (!flags.d && action.error) log(action.error)
				if (!flags.q && !flags.d && stdout) log(stdout)
				if (action.onError) action.onError(result)
				throw new Error(stderr)
			}

			if (code !== 0) {
				if (action.onError) action.onError(result)
				if (action.error) log(action.error)
				throw new Error(`Command '${action.command}' returned exit code: ${code}.`)
			}

			if (code === 0 && stderr) {
				if (!flags.d && !flags.q) log(stderr)
				if (!flags.d && action.warn) log(action.warn)
				if (action.onWarn) action.onWarn(result)
			}

			if (!flags.d && !flags.q && stdout) log(stdout)
			if (!flags.d && action.success) log(action.success)
			if (action.onSuccess) action.onSuccess(result)

			return result
		})
})

// Creates an action queue using program object
const createQueue = program => {
	const preRunPromise = preRun => new Promise(resolve => {
    resolve(preRun)
	})

  return program.actions
    .filter(action => action.command)
    .map(action => {
      return () => handle(action, program.options, preRunPromise(action.preRun))
    })
}

const getProgram = (programCreator, input) => {
  if (isArray(programCreator)) {
    const convertItem = item => {
      if (typeof item === 'string') {
        return { command: item }
      }

      return item
    }

    return {
      actions: programCreator.map(item => convertItem(item)).filter(Boolean)
    }
  }

  if (!isArray(programCreator) && typeof programCreator === 'object') {
    return programCreator
  }

  if (typeof programCreator === 'function') {
    return programCreator(input.args, input.flags)
  }

  throw new Error(`run() expected the first argument to be either a function, object or an array. Got type: ${typeof programCreator}`)
}

// Get command line arguments and flags
// Use programCreator to create program object
// Create and start the action queue
const run = programCreator => {
  const input = getInput(process)
  const program = getProgram(programCreator, input)
  const queue = createQueue(program)

  waterfall(queue).catch(err => error(err))
}

module.exports = { getInput, run }
