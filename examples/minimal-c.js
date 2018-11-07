const { run } = require('../app')

// Program as an object

const program = {
  actions: [{
    command: 'echo "Whats up?"'
  }, {
    command: 'echo "Not much, how about you?"'
  }, {
    command: 'echo "Same"'
  }]
}

// This is equivalent of running the following in the terminal:
// $ echo "Whats up?" && echo "Not much, how about you?" && echo "Same"

run(program)
