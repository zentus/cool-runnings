#!/usr/bin/env node

const cwd = process.cwd()
const { platform } = process
const fs = require('fs')
const path = require('path')
const has = fs.existsSync

const { run } = require('../app')
const chalk = require('chalk')
const { green, bold } = chalk

const program = (args, flags) => {
  const message = args[0]
  const coolFile = path.join(cwd, 'cool.file')
  const needCoolFile = !has(coolFile)
  const needIce = Boolean(flags.ice) || Boolean(flags.i)
  const iceFile = path.join(cwd, 'ice')
  const hasIce = has(iceFile)
  const needUncoolFile = hasIce && platform === 'win32'

  const giveIce = {
    command: 'touch ice && echo "cool runnings ❄️" >> ice',
    success: bold.cyan('Your ice: ❄️❄️❄️')
  }

  return {
    actions: [{
      command: needCoolFile && `echo "So you need a cool file?"`
    }, {
      command: needCoolFile && 'touch cool.file',
      success: green('Created a cool file')
    }, {
      command: has(coolFile),
      success: green('\nNice file')
    }, {
      command: has(coolFile) && message && `echo ${message} >> cool.file`,
      success: green(`Wrote your message to the cool file`)
    },
    // Falsey items in 'actions' will be filtered out
    needIce && giveIce,
    {
      command: needUncoolFile && 'touch uncool-file.docx'
    }],
    options: { hmm: '🤔' }
  }
}

run(program)
