const express = require.fromParentEnvironment('express')
const next = require.fromParentEnvironment('next')
const pkg = require.fromParentEnvironment('./package.json')

const app = next({ dev: false })
const handle = app.getRequestHandler()

async function createServer() {
  await app.prepare()
  const server = express()

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = pkg.binaryTypes || ['*/*']

  return server
}

module.exports = createServer
