const CONFIGS = {
  templateUrl:
    'https://serverless-templates-1300862921.cos.ap-beijing.myqcloud.com/nextjs-demo.zip',
  compName: 'nextjs',
  compFullname: 'Next.js',
  handler: 'sl_handler.handler',
  runtime: 'Nodejs10.15',
  timeout: 3,
  memorySize: 128,
  namespace: 'default',
  description: 'Created by Serverless Component',
  defaultStatics: [
    { src: '.next', targetDir: '/_next' },
    { src: 'public', targetDir: '/' }
  ],
  defaultCdnConf: {
    autoRefresh: true,
    forceRedirect: {
      switch: 'on',
      redirectType: 'https',
      redirectStatusCode: 301
    },
    https: {
      switch: 'on',
      http2: 'on'
    }
  }
}

module.exports = CONFIGS
