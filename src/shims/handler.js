const fs = require('fs')
const path = require('path')
const { createServer, proxy } = require('tencent-serverless-http')
const createApp = require('./sls')

module.exports.handler = async (event, context) => {
  const userSls = path.join(__dirname, 'sls.js')
  let app = await createApp()
  if (fs.existsSync(userSls)) {
    // eslint-disable-next-line
    console.log('Using user custom sls.js')
    app = await require(userSls)()
  }

  context.callbackWaitsForEmptyEventLoop =
    app.callbackWaitsForEmptyEventLoop === true ? true : false

  const server = createServer(app, null, app.binaryTypes || [])
  return proxy(server, event, context, 'PROMISE').promise
}
