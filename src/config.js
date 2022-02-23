Object.defineProperty(exports, '__esModule', { value: true })
exports.getConfig = void 0
const fs = require('fs')
const path = require('path')
const YAML = require('js-yaml')
const TEMPLATE_BASE_URL = 'https://serverless-templates-1300862921.cos.ap-beijing.myqcloud.com'
const frameworks = {
  express: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [{ src: 'public', targetDir: '/' }]
  },
  koa: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [{ src: 'public', targetDir: '/' }]
  },
  egg: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [{ src: 'public', targetDir: '/' }],
    defaultEnvs: [
      {
        key: 'SERVERLESS',
        value: '1'
      },
      {
        key: 'EGG_APP_CONFIG',
        value: '{"rundir":"/tmp","logger":{"dir":"/tmp"}}'
      }
    ]
  },
  nestjs: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [{ src: 'public', targetDir: '/' }]
  },
  nextjs: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [
      { src: '.next/static', targetDir: '/_next/static' },
      { src: 'public', targetDir: '/' }
    ]
  },
  nuxtjs: {
    injectSlsSdk: true,
    runtime: 'Nodejs10.15',
    defaultEntryFile: 'sls.js',
    defaultStatics: [
      { src: '.nuxt/dist/client', targetDir: '/' },
      { src: 'static', targetDir: '/' }
    ]
  },
  laravel: {
    injectSlsSdk: false,
    runtime: 'Php7',
    defaultEnvs: [
      {
        key: 'SERVERLESS',
        value: '1'
      },
      {
        key: 'VIEW_COMPILED_PATH',
        value: '/tmp/storage/framework/views'
      },
      {
        key: 'SESSION_DRIVER',
        value: 'array'
      },
      {
        key: 'LOG_CHANNEL',
        value: 'stderr'
      },
      {
        key: 'APP_STORAGE',
        value: '/tmp/storage'
      }
    ]
  },
  thinkphp: {
    injectSlsSdk: false,
    runtime: 'Php7'
  },
  flask: {
    injectSlsSdk: false,
    runtime: 'Python3.6'
  },
  django: {
    injectSlsSdk: false,
    runtime: 'Python3.6'
  }
}
const CONFIGS = {
  // support metrics frameworks
  pythonFrameworks: ['flask', 'django'],
  supportMetrics: ['express', 'next', 'nuxt'],
  region: 'ap-guangzhou',
  description: 'Created by Serverless Component',
  handler: 'sl_handler.handler',
  timeout: 10,
  memorySize: 128,
  namespace: 'default',
  defaultEnvs: [
    {
      key: 'SERVERLESS',
      value: '1'
    }
  ],
  cos: {
    lifecycle: [
      {
        status: 'Enabled',
        id: 'deleteObject',
        expiration: { days: '10' },
        abortIncompleteMultipartUpload: { daysAfterInitiation: '10' }
      }
    ]
  },
  cdn: {
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
  defaultCdnConfig: {
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
          Resource: [`qcs::cos:${region}:uid/${appid}:${bucket}/*`]
        }
      ],
      version: '2.0'
    }
  }
}
const getConfig = () => {
  const { name: framework } = YAML.load(
    // framework.yml 会在组件部署流程中动态生成
    fs.readFileSync(path.join(__dirname, 'framework.yml'), 'utf-8')
  )
  const templateUrl = `${TEMPLATE_BASE_URL}/${framework}-demo.zip`
  const frameworkConfigs = frameworks[framework]
  return Object.assign(Object.assign({ framework, templateUrl }, CONFIGS), frameworkConfigs)
}
exports.getConfig = getConfig
