const { createServer, proxy } = require('tencent-serverless-http')

module.exports.handler = async (event, context) => {
  const createApp = require.fromParentEnvironment('./sls')
  const app = await createApp()
  const server = createServer(app, null, app.binaryTypes || [])
  return proxy(server, event, context, 'PROMISE').promise
}
