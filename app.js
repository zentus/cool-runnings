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
const handle = (action, options) => shell(action.command)
  .then(result => {
    const { stdout, stderr, code } = result
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
      throw new Error(`Command '${action.command}' returned exit code: ${code}.`)
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

  waterfall(queue)
    .then(result => {
      // const lastCommand = {
      //   action: program.actions.find(action => action.command === cmd),
      //   result
      // }
    })
    .catch(err => error(err))
}

module.exports = { getInput, run }
