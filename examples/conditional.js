const { run } = require('../app')

const program = (args, flags) => {
  const name = args[0]

  return {
    actions: [{
      command: name ? `echo "Whats up ${name}?"` : 'echo "Whats up?"'
    }, {
      // If command is falsey, it will be skipped
      command: flags.answer && 'echo "Not much, how about you?"'
    }, {
      command: flags.answer && 'echo "Same"'
    }]
  }
}

run(program)

// $ node conditional
// => Whats up?

// $ node conditional Odeya
// => Whats up Odeya?

// $ node conditional Odeya --answer
// => Whats up Odeya?
// => Not much, how about you?
// => Same
