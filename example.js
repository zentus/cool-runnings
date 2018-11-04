#!/usr/bin/env node
const cwd = process.cwd()
const { platform } = process
const fs = require('fs')
const path = require('path')
const has = fs.existsSync

const { run } = require('./app')
const { log } = console
const chalk = require('chalk')
const { green, bold } = chalk

const program = ({ arguments, flags }) => {
	const message = arguments[0]
	const coolFile = path.join(cwd, 'cool.file')
	const needCoolFile = !has(coolFile)
	const needIce = Boolean(flags.ice)
	const iceFile = path.join(cwd, 'ice')
	const hasIce = has(iceFile)
	const needUncoolFile = hasIce && platform === 'win32'

	const giveIce = {
		command: 'touch ice && echo "cool runnings!❄️" >> ice',
		success: bold.cyan('jah jah youth man 🇯🇲')
	}

	// Create an object like
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
				command: has(coolFile) && message && `echo "${message}" >> cool.file`,
				success: green(`Wrote your message to the cool file`)
			},
			needIce && giveIce,
			{
				command: needUncoolFile && 'touch uncool-file.docx'
		}].filter(Boolean),
		options: { hmm: '🤔' }
	}
}

run(program)
