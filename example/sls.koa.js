const Koa = require('koa')
const Router = require('@koa/router')
const multer = require('@koa/multer')
const next = require('next')

const isServerless = process.env.SERVERLESS

async function createServer() {
  const server = new Koa()
  const router = new Router()
  const upload = multer({ dest: isServerless ? '/tmp/upload' : './upload' })
  const app = next({ dev: false })
  const handle = app.getRequestHandler()

  router.post('/upload', upload.single('file'), (ctx) => {
    ctx.body = {
      success: true,
      data: ctx.file
    }
  })

  server.use(router.routes()).use(router.allowedMethods())

  server.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx

    return handle(ctx.req, ctx.res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = ['*/*']

  return server
}

if (process.env.SERVERLESS) {
  module.exports = createServer
} else {
  createServer().then((server) => {
    server.listen(3000, () => {
      console.log(`Server start on http://localhost:3000`)
    })
  })
}
