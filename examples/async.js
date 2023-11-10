const { run } = require('../app') // const { run } = require('cool-runnings')

const program = () => {
  return {
    actions: [
      async (previous, index) => {
        console.log('Watching paint dry..')

        await (new Promise(resolve => setTimeout(resolve, 5000)))

        return {
          command: 'echo "I think its dry now!"',
          success: `Success: Action ${index}`
        }
      },
      async (previous, index) => {
        console.log('Making pancakes..')

        await (new Promise(resolve => setTimeout(resolve, 5000)))

        return {
          command: 'echo "Sound good!"',
          success: `Success: Action ${index}`
        }
      },
      async (previous, index) => {
        console.log('Making more pancakes..')

        await (new Promise(resolve => setTimeout(resolve, 5000)))

        return {
          command: 'echo "Oh no!" && exit 1',
          error: `Error: Action ${index}`,
          name: 'Try making more pancakes',
          onError: async (result) => {
            console.log('Something went wrong..')
            await (new Promise(resolve => setTimeout(resolve, 5000)))
            console.log(result)
          },
          success: `Success: Action ${index}`
        }
      },
      async (previous, index) => {
        console.log('Looking for solution..')

        await (new Promise(resolve => setTimeout(resolve, 5000)))

        return {
          command: 'echo "What happened?"',
          error: `Error: Action ${index}`,
          success: `Success: Action ${index}`
        }
      }
    ]
  }
}

run(program)
