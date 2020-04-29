const fs = require('fs')
const path = require('path')
const { createServer, proxy } = require('tencent-serverless-http')
const createApp = require('./sls')

let server

module.exports.handler = async (event, context) => {
  const userSls = path.join(__dirname, '..', 'sls.js')
  let app = await createApp()
  if (fs.existsSync(userSls)) {
    // eslint-disable-next-line
    console.log('Using user custom sls.js')
    app = await require(userSls)()
  }

  if (!server) {
    server = createServer(app, null, app.binaryTypes || [])
  }

  context.callbackWaitsForEmptyEventLoop =
    app.callbackWaitsForEmptyEventLoop === true ? true : false

  return proxy(server, event, context, 'PROMISE').promise
}
