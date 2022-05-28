const shell = require('shell-exec').default
const minimist = require('minimist')
const waterfall = require('p-waterfall')
const omit = require('object.omit')
const { log, error, warn } = console

const getInput = process => {
  const { _: args, ...flags } = minimist(process.argv.slice(2))
  return { args, flags }
}

const getPreRunPromise = preRun => new Promise(resolve => {
  resolve(preRun)
})

const handleAction = (action, options = {}, preRunPromise, ignoreAction, history) => preRunPromise.then(preRun => {
  const { flags } = getInput(process)

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

  if (preRun && !flags.d) {
    log(preRun)
  }

  if (action.onPreRun && typeof action.onPreRun === 'function') {
    action.onPreRun(action)
  }

  if (ignoreAction) {
    if (flags.v) log(`Ignored action ${action.name}`)

    const ignoredResult = {
      code: null,
      stdout: '',
      stderr: '',
      ignored: true,
      name: action.name,
      history
    }

    if (typeof action.ignored === 'function') {
      action.ignored = action.ignored(ignoredResult)
    }

    if (action.ignored && !flags.q && !flags.d) log(action.ignored)
    if (action.onIgnored && !flags.q && !flags.d) action.onIgnored(ignoredResult)

    return new Promise(resolve => resolve(ignoredResult))
  }

  return shell(action.command)
    .then(rawResult => {
      if (flags.v) log(`Started action: ${action.name}`)

      const result = {
        ...rawResult,
        ignored: false,
        name: action.name,
        history
      }
      const { stdout, stderr, code } = result

      if (typeof action.error === 'function') {
        action.error = action.error(result)
      }

      if (typeof action.warn === 'function') {
        action.warn = action.warn(result)
      }

      if (typeof action.success === 'function') {
        action.success = action.success(result)
      }

      if (code !== 0 && stderr) {
        if (action.error && !flags.d) error(action.error)
        if (stdout && !flags.q && !flags.d) error(stdout)
        if (action.onError && !flags.d) action.onError(result)
        throw new Error(stderr)
      }

      if (code !== 0 && !stderr) {
        if (action.onError && !flags.d) action.onError(result)
        if (action.error && !flags.d) log(action.error)
        throw new Error(`Command '${action.command}' returned exit code: ${code}.`)
      }

      if (code === 0 && stderr) {
        if (!flags.d && !flags.q) warn(stderr)
        if (action.warn && !flags.d) warn(action.warn)
        if (action.onWarn && !flags.d) action.onWarn(result)
      }

      if (stdout && !flags.d && !flags.q) log(stdout)
      if (action.success && !flags.d) log(action.success)
      if (action.onSuccess && !flags.d) action.onSuccess(result)

      return result
    })
    .then(result => {
      if (action.onPostRun && typeof action.onPostRun === 'function') {
        action.onPostRun(result)
      }

      return result
    })
})

const createQueue = program => {
  const history = []

  return program.actions
    .map((actionFunc, index) => {
      return lastExecuted => {
        if (lastExecuted) {
          history.push(omit(lastExecuted, 'history'))
        }
        const actionRaw = actionFunc(lastExecuted)
        const action = {
          ...actionRaw,
          name: actionRaw.name || index
        }
        const preRunPromise = getPreRunPromise(action.preRun)
        const ignoreAction = !action.command
        return handleAction(action, program.options, preRunPromise, ignoreAction, history)
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
const run = programCreator => {
  const input = getInput(process)
  const program = getProgram(programCreator, input)
  const queue = createQueue(program)

  return waterfall(queue).catch(err => {
    error(err)
    return err
  })
}

module.exports = { getInput, run }
