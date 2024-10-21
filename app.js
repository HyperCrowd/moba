'use strict'
// eslint-disable-next-line
const url = require('node:url')

const baseUri = url.pathToFileURL(__dirname).toString()

const interfaceUri = process.env.NWJS_START_URL
  ? process.env.NWJS_START_URL.trim()
  : `${baseUri}/dist/`

const startUri = `${interfaceUri}/index.html`

// eslint-disable-next-line no-undef
nw.Window.open(startUri, { icon: './dist/vite.svg' })
