const minimist = require('minimist')
const omit = require('object.omit')
const waterfall = require('p-waterfall')
let shell = require('shell-exec')
shell = shell || shell.default

const getInput = process => {
  const { _: args, ...flags } = minimist(process.argv.slice(2))
  return { args, flags }
}

const overrideFlags = (flags, options) => {
  if (options.quiet) {
    flags.q = true
  }

  if (options.dead) {
    flags.d = true
    flags.q = true
  }

  if (options.verbose) {
    flags.v = true
    flags.d = false
    flags.q = false
  }

  return flags
}

const handleError = async (action, result, flags) => {
  const { code, stderr, stdout } = result

  if (typeof action.error === 'function') {
    action.error = await action.error(result)
  }

  if (typeof action.warn === 'function') {
    action.warn = await action.warn(result)
  }

  if (typeof action.success === 'function') {
    action.success = await action.success(result)
  }

  if (code !== 0 && stderr) {
    if (action.error && !flags.d) console.error(action.error)
    if (stdout && !flags.q && !flags.d) console.error(stdout)
    if (action.onError) await action.onError(result)
    throw new Error(stderr)
  }

  if (code !== 0 && !stderr) {
    if (action.error && !flags.d) console.log(action.error)
    if (stdout && !flags.q && !flags.d) console.error(stdout)
    if (action.onError) await action.onError(result)
    const identifier = action.name !== result.index
      ? `"${action.name}"`
      : `Command "${action.command}"`
    throw new Error(`${identifier} exited with code ${code}`)
  }

  if (code === 0 && stderr) {
    if (!flags.d && !flags.q) console.warn(stderr)
    if (action.warn && !flags.d) console.warn(action.warn)
    if (action.onWarn && !flags.d) await action.onWarn(result)
  }

  if (stdout && !flags.d && !flags.q) console.log(stdout)
  if (action.success && !flags.d) console.log(action.success)
  if (action.onSuccess && !flags.d) await action.onSuccess(result)
}

const handleIgnoredAction = async (action, flags, history) => {
  if (flags.v) console.log(`Ignored action ${action.name}`)

  const ignoredResult = {
    code: null,
    history,
    ignored: true,
    name: action.name,
    stderr: '',
    stdout: ''
  }

  if (typeof action.ignored === 'function') {
    action.ignored = await action.ignored(ignoredResult)
  }

  if (action.ignored && !flags.q && !flags.d) console.log(action.ignored)
  if (action.onIgnored && !flags.q && !flags.d) await action.onIgnored(ignoredResult)

  return new Promise(resolve => resolve(ignoredResult))
}

const handleAction = async (action, options = {}, ignoreAction, history) => {
  const input = getInput(process)
  const flags = overrideFlags(input.flags, options)

  if (ignoreAction) {
    return handleIgnoredAction(action, flags, history)
  }

  if (action.preRun && !flags.d) {
    console.log(action.preRun)
  }

  if (action.onPreRun && typeof action.onPreRun === 'function') {
    await action.onPreRun(action)
  }

  const rawResult = await shell(action.command)

  if (flags.v) console.log(`Started action: ${action.name}`)

  const result = {
    ...rawResult,
    history,
    ignored: false,
    index: action.index,
    name: action.name
  }

  await handleError(action, result, flags)

  if (action.onPostRun && typeof action.onPostRun === 'function') {
    await action.onPostRun(result)
  }

  return result
}

const createQueue = program => {
  const history = []

  return program.actions
    .map((actionFunc, index) => {
      return async lastExecuted => {
        if (lastExecuted) {
          history.push(omit(lastExecuted, 'history'))
        }
        const action = await actionFunc(lastExecuted, index)
        const indexedAction = {
          ...action,
          index,
          name: action.name || index
        }
        const ignoreAction = !action.command
        return handleAction(indexedAction, program.options, ignoreAction, history)
      }
    })
}

const getProgram = (programCreator, input) => {
  if (typeof programCreator !== 'function') {
    throw new Error(`run(program) expected the first argument to be a function. Instead got type '${typeof programCreator}'.`)
  }

  const program = programCreator(input.args, input.flags)

  if (!Array.isArray(program.actions)) {
    throw new Error(`run(program) expected program to return an object with the key 'actions' being an array. Instead got type '${typeof program.actions}'.`)
  }

  program.actions.forEach(action => {
    if (typeof action !== 'function') {
      throw new Error(`run(program) expected program to return an object with the key 'actions' being an array of functions. Instead got an item of type '${typeof program.actions}' in 'actions'.`)
    }
  })

  return program
}
const run = async programCreator => {
  const input = getInput(process)
  const program = getProgram(programCreator, input)
  const queue = createQueue(program)

  return waterfall(queue)
}

module.exports = { getInput, run }
