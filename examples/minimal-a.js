const { run } = require('../app')

// Program as an array of strings

const program = [
  'echo "Whats up?"',
  'echo "Not much, how about you?"',
  'echo "Same"'
]

// This is equivalent of running the following in the terminal:
// $ echo "Whats up?" && echo "Not much, how about you?" && echo "Same"

run(program)
