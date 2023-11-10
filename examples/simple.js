const { run } = require('../app') // const { run } = require('cool-runnings')

const program = () => {
  return {
    actions: [
      () => ({
        command: 'echo "Hello!"',
        success: '* Said hello'
      }),
      () => ({
        command: 'echo "Hi!"',
        success: '* Responded'
      })
    ]
  }
}

run(program)
