const { createServer, proxy } = require('tencent-serverless-http')
const createApp = require('./sls')

module.exports.handler = async (event, context) => {
  const app = await createApp()
  const server = createServer(app, null, app.binaryTypes || [])
  return proxy(server, event, context, 'PROMISE').promise
}
