const isProd = process.env.NODE_ENV === 'production'
const CDN_URL = 'https://test.yuga.chat'
module.exports = {
  env: {
    STATIC_URL: isProd ? CDN_URL : 'http://localhost:3000'
  },
  assetPrefix: isProd ? CDN_URL : ''
}
