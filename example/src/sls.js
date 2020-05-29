const express = require('express')
const next = require('next')

const app = next({ dev: false })
const handle = app.getRequestHandler()

async function createServer() {
  await app.prepare()
  const server = express()

  // page routes
  const pageRoutes = app.pagesManifest

  Object.keys(pageRoutes).forEach((route) => {
    server.get(route, (req, res) => {
      return handle(req, res)
    })
  })

  server.all('*', (req, res) => {
    req.__SLS_NO_REPORT__ = true
    return handle(req, res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = ['*/*']

  return server
}

createServer().then((server) => {
  server.listen(8080)
})

module.exports = createServer
