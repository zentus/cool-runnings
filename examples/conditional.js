const { run } = require('../app') // const { run } = require('cool-runnings')

const program = (args, flags) => {
  const [name] = args

  return {
    actions: [
      () => ({
        command: name ? `echo "Whats up ${name}?"` : 'echo "Whats up?"'
      }),
      previous => ({
        // If command is falsy, it will be ignored
        command: flags.answer && `echo "You said: *${previous.stdout.trim()}*. My answer is not much, how about you?"`
      })
    ]
  }
}

run(program)
