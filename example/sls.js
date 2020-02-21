const express = require('express');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

async function creatServer() {
  await app.prepare();
  const server = express()

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = [
    '*/*',
  ]

  return server
}

module.exports = creatServer
