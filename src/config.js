const CONFIGS = {
  templateUrl:
    'https://serverless-templates-1300862921.cos.ap-beijing.myqcloud.com/nextjs-demo.zip',
  compName: 'nextjs',
  compFullname: 'Next.js',
  defaultEntryFile: 'sls.js',
  region: 'ap-guangzhou',
  handler: 'sl_handler.handler',
  runtime: 'Nodejs10.15',
  timeout: 3,
  memorySize: 128,
  namespace: 'default',
  description: 'Created by Serverless Component',
  defaultStatics: [
    { src: '.next/static', targetDir: '/_next/static' },
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
  },
  acl: {
    permissions: 'public-read',
    grantRead: '',
    grantWrite: '',
    grantFullControl: ''
  },
  getPolicy(region, bucket, appid) {
    return {
      Statement: [
        {
          Principal: { qcs: ['qcs::cam::anyone:anyone'] },
          Effect: 'Allow',
          Action: [
            'name/cos:HeadBucket',
            'name/cos:ListMultipartUploads',
            'name/cos:ListParts',
            'name/cos:GetObject',
            'name/cos:HeadObject',
            'name/cos:OptionsObject'
          ],
          Resource: [`qcs::cos:${region}:uid/${appid}:${bucket}-${appid}/*`]
        }
      ],
      version: '2.0'
    }
  }
}

module.exports = CONFIGS
