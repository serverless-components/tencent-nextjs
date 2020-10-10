const path = require('path')
const { Cos } = require('tencent-component-toolkit')
const { TypeError } = require('tencent-component-toolkit/src/utils/error')
const ensureObject = require('type/object/ensure')
const ensureIterable = require('type/iterable/ensure')
const ensureString = require('type/string/ensure')
const download = require('download')
const AdmZip = require('adm-zip')
const CONFIGS = require('./config')

const generateId = () =>
  Math.random()
    .toString(36)
    .substring(6)

const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const getType = (obj) => {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

const mergeJson = (sourceJson, targetJson) => {
  Object.entries(sourceJson).forEach(([key, val]) => {
    targetJson[key] = deepClone(val)
  })
  return targetJson
}

const capitalString = (str) => {
  if (str.length < 2) {
    return str.toUpperCase()
  }

  return `${str[0].toUpperCase()}${str.slice(1)}`
}

const getDefaultProtocol = (protocols) => {
  return String(protocols).includes('https') ? 'https' : 'http'
}

const getDefaultFunctionName = () => {
  return `${CONFIGS.compName}_component_${generateId()}`
}

const getDefaultServiceName = () => {
  return 'serverless'
}

const getDefaultServiceDescription = () => {
  return 'Created by Serverless Component'
}

const removeAppid = (str, appid) => {
  const suffix = `-${appid}`
  if (!str || str.indexOf(suffix) === -1) {
    return str
  }
  return str.slice(0, -suffix.length)
}

const validateTraffic = (num) => {
  if (getType(num) !== 'Number') {
    throw new TypeError(
      `PARAMETER_${CONFIGS.compName.toUpperCase()}_TRAFFIC`,
      'traffic must be a number'
    )
  }
  if (num < 0 || num > 1) {
    throw new TypeError(
      `PARAMETER_${CONFIGS.compName.toUpperCase()}_TRAFFIC`,
      'traffic must be a number between 0 and 1'
    )
  }
  return true
}

const getCodeZipPath = async (instance, inputs) => {
  console.log(`Packaging ${CONFIGS.compFullname} application...`)

  // unzip source zip file
  let zipPath
  if (!inputs.code.src) {
    // add default template
    const downloadPath = `/tmp/${generateId()}`
    const filename = 'template'

    console.log(`Installing Default ${CONFIGS.compFullname} App...`)
    try {
      await download(CONFIGS.templateUrl, downloadPath, {
        filename: `${filename}.zip`
      })
    } catch (e) {
      throw new TypeError(`DOWNLOAD_TEMPLATE`, 'Download default template failed.')
    }
    zipPath = `${downloadPath}/${filename}.zip`
  } else {
    zipPath = inputs.code.src
  }

  return zipPath
}

/**
 * Upload code to COS
 * @param {Component} instance serverless component instance
 * @param {string} appId app id
 * @param {object} credentials credentials
 * @param {object} inputs component inputs parameters
 * @param {string} region region
 */
const uploadCodeToCos = async (instance, appId, credentials, inputs, region) => {
  const bucketName = inputs.code.bucket || `sls-cloudfunction-${region}-code`
  const objectName = inputs.code.object || `${inputs.name}-${Math.floor(Date.now() / 1000)}.zip`
  // if set bucket and object not pack code
  if (!inputs.code.bucket || !inputs.code.object) {
    const zipPath = await getCodeZipPath(instance, inputs)
    console.log(`Code zip path ${zipPath}`)

    // save the zip path to state for lambda to use it
    instance.state.zipPath = zipPath

    const cos = new Cos(credentials, region)

    if (!inputs.code.bucket) {
      // create default bucket
      await cos.deploy({
        bucket: bucketName + '-' + appId,
        force: true,
        lifecycle: [
          {
            status: 'Enabled',
            id: 'deleteObject',
            filter: '',
            expiration: { days: '10' },
            abortIncompleteMultipartUpload: { daysAfterInitiation: '10' }
          }
        ]
      })
    }

    // upload code to cos
    if (!inputs.code.object) {
      console.log(`Getting cos upload url for bucket ${bucketName}`)
      const uploadUrl = await cos.getObjectUrl({
        bucket: bucketName + '-' + appId,
        object: objectName,
        method: 'PUT'
      })

      // if shims and sls sdk entries had been injected to zipPath, no need to injected again
      console.log(`Uploading code to bucket ${bucketName}`)
      if (instance.codeInjected === true) {
        await instance.uploadSourceZipToCOS(zipPath, uploadUrl, {}, {})
      } else {
        const slsSDKEntries = instance.getSDKEntries('_shims/handler.handler')
        await instance.uploadSourceZipToCOS(zipPath, uploadUrl, slsSDKEntries, {
          _shims: path.join(__dirname, '_shims')
        })
        instance.codeInjected = true
      }
      console.log(`Upload ${objectName} to bucket ${bucketName} success`)
    }
  }

  // save bucket state
  instance.state.bucket = bucketName
  instance.state.object = objectName

  return {
    bucket: bucketName,
    object: objectName
  }
}

const prepareStaticCosInputs = async (instance, inputs, appId, codeZipPath) => {
  try {
    const staticCosInputs = []
    const { cosConf } = inputs
    const sources = cosConf.sources || CONFIGS.defaultStatics
    const { bucket } = cosConf
    // remove user append appid
    const bucketName = removeAppid(bucket, appId)
    const staticPath = `/tmp/${generateId()}`
    const codeZip = new AdmZip(codeZipPath)
    const entries = codeZip.getEntries()

    // traverse sources, generate static directory and deploy to cos
    for (let i = 0; i < sources.length; i++) {
      const curSource = sources[i]
      const entryName = `${curSource.src}`
      let exist = false
      entries.forEach((et) => {
        if (et.entryName.indexOf(entryName) === 0) {
          codeZip.extractEntryTo(et, staticPath, true, true)
          exist = true
        }
      })
      if (exist) {
        const cosInputs = {
          force: true,
          protocol: cosConf.protocol,
          bucket: `${bucketName}-${appId}`,
          src: `${staticPath}/${entryName}`,
          keyPrefix: curSource.targetDir || '/',
          acl: {
            permissions: 'public-read',
            grantRead: '',
            grantWrite: '',
            grantFullControl: ''
          }
        }

        if (cosConf.acl) {
          cosInputs.acl = {
            permissions: cosConf.acl.permissions || 'public-read',
            grantRead: cosConf.acl.grantRead || '',
            grantWrite: cosConf.acl.grantWrite || '',
            grantFullControl: cosConf.acl.grantFullControl || ''
          }
        }

        staticCosInputs.push(cosInputs)
      }
    }
    return staticCosInputs
  } catch (e) {
    throw new TypeError(
      `UTILS_${CONFIGS.compName.toUpperCase()}_prepareStaticCosInputs`,
      e.message,
      e.stack
    )
  }
}

const prepareStaticCdnInputs = async (instance, inputs, origin) => {
  try {
    const { cdnConf } = inputs
    const cdnInputs = {
      async: true,
      area: cdnConf.area || 'mainland',
      domain: cdnConf.domain,
      serviceType: 'web',
      origin: {
        origins: [origin],
        originType: 'cos',
        originPullProtocol: 'https'
      },
      autoRefresh: true,
      ...cdnConf
    }
    if (cdnConf.https) {
      // using these default configs, for making user's config more simple
      cdnInputs.forceRedirect = cdnConf.https.forceRedirect || CONFIGS.defaultCdnConf.forceRedirect
      if (!cdnConf.https.certId) {
        throw new TypeError(
          `PARAMETER_${CONFIGS.compName.toUpperCase()}_HTTPS`,
          'https.certId is required'
        )
      }
      cdnInputs.https = {
        ...CONFIGS.defaultCdnConf.https,
        ...{
          http2: cdnConf.https.http2 || 'on',
          certInfo: {
            certId: cdnConf.https.certId
          }
        }
      }
    }
    if (cdnInputs.autoRefresh) {
      cdnInputs.refreshCdn = {
        flushType: cdnConf.refreshType || 'delete',
        urls: [`http://${cdnInputs.domain}`, `https://${cdnInputs.domain}`]
      }
    }

    return cdnInputs
  } catch (e) {
    throw new TypeError(
      `UTILS_${CONFIGS.compName.toUpperCase()}_prepareStaticCdnInputs`,
      e.message,
      e.stack
    )
  }
}

const prepareInputs = async (instance, credentials, inputs = {}) => {
  // 对function inputs进行标准化
  const tempFunctionConf = inputs.functionConf
    ? inputs.functionConf
    : inputs.functionConfig
    ? inputs.functionConfig
    : {}
  const fromClientRemark = `tencent-${CONFIGS.compName}`
  const regionList = inputs.region
    ? typeof inputs.region == 'string'
      ? [inputs.region]
      : inputs.region
    : ['ap-guangzhou']

  // chenck state function name
  const stateFunctionName =
    instance.state[regionList[0]] && instance.state[regionList[0]].functionName
  const functionConf = Object.assign(tempFunctionConf, {
    code: {
      src: inputs.src,
      bucket: inputs.srcOriginal && inputs.srcOriginal.bucket,
      object: inputs.srcOriginal && inputs.srcOriginal.object
    },
    name:
      ensureString(inputs.functionName, { isOptional: true }) ||
      stateFunctionName ||
      getDefaultFunctionName(),
    region: regionList,
    role: ensureString(tempFunctionConf.role ? tempFunctionConf.role : inputs.role, {
      default: ''
    }),
    handler: ensureString(tempFunctionConf.handler ? tempFunctionConf.handler : inputs.handler, {
      default: CONFIGS.handler
    }),
    runtime: ensureString(tempFunctionConf.runtime ? tempFunctionConf.runtime : inputs.runtime, {
      default: CONFIGS.runtime
    }),
    namespace: ensureString(
      tempFunctionConf.namespace ? tempFunctionConf.namespace : inputs.namespace,
      { default: CONFIGS.namespace }
    ),
    description: ensureString(
      tempFunctionConf.description ? tempFunctionConf.description : inputs.description,
      {
        default: CONFIGS.description
      }
    ),
    fromClientRemark,
    layers: ensureIterable(tempFunctionConf.layers ? tempFunctionConf.layers : inputs.layers, {
      default: []
    }),
    cfs: ensureIterable(tempFunctionConf.cfs ? tempFunctionConf.cfs : inputs.cfs, {
      default: []
    }),
    publish: inputs.publish,
    traffic: inputs.traffic,
    lastVersion: instance.state.lastVersion,
    timeout: tempFunctionConf.timeout ? tempFunctionConf.timeout : CONFIGS.timeout,
    memorySize: tempFunctionConf.memorySize ? tempFunctionConf.memorySize : CONFIGS.memorySize,
    tags: ensureObject(tempFunctionConf.tags ? tempFunctionConf.tags : inputs.tags, {
      default: null
    })
  })

  // validate traffic
  if (inputs.traffic !== undefined) {
    validateTraffic(inputs.traffic)
  }
  functionConf.needSetTraffic = inputs.traffic !== undefined && functionConf.lastVersion

  if (tempFunctionConf.environment) {
    functionConf.environment = tempFunctionConf.environment
    functionConf.environment.variables = functionConf.environment.variables || {}
    functionConf.environment.variables.SERVERLESS = '1'
    functionConf.environment.variables.SLS_ENTRY_FILE = inputs.entryFile || CONFIGS.defaultEntryFile
  } else {
    functionConf.environment = {
      variables: {
        SERVERLESS: '1',
        SLS_ENTRY_FILE: inputs.entryFile || CONFIGS.defaultEntryFile
      }
    }
  }
  if (tempFunctionConf.vpcConfig) {
    functionConf.vpcConfig = tempFunctionConf.vpcConfig
  }

  // 对apigw inputs进行标准化
  const tempApigwConf = inputs.apigatewayConf
    ? inputs.apigatewayConf
    : inputs.apigwConfig
    ? inputs.apigwConfig
    : {}
  const apigatewayConf = Object.assign(tempApigwConf, {
    serviceId: inputs.serviceId || tempApigwConf.serviceId,
    region: regionList,
    isDisabled: tempApigwConf.isDisabled === true,
    fromClientRemark: fromClientRemark,
    serviceName: inputs.serviceName || tempApigwConf.serviceName || getDefaultServiceName(instance),
    serviceDesc: tempApigwConf.serviceDesc || getDefaultServiceDescription(instance),
    protocols: tempApigwConf.protocols || ['http'],
    environment: tempApigwConf.environment ? tempApigwConf.environment : 'release',
    customDomains: tempApigwConf.customDomains || []
  })
  if (!apigatewayConf.endpoints) {
    apigatewayConf.endpoints = [
      {
        path: tempApigwConf.path || '/',
        enableCORS: tempApigwConf.enableCORS,
        serviceTimeout: tempApigwConf.serviceTimeout,
        method: 'ANY',
        apiName: tempApigwConf.apiName || 'index',
        function: {
          isIntegratedResponse: true,
          functionName: functionConf.name,
          functionNamespace: functionConf.namespace,
          functionQualifier:
            (tempApigwConf.function && tempApigwConf.function.functionQualifier) || '$LATEST'
        }
      }
    ]
  }
  if (tempApigwConf.usagePlan) {
    apigatewayConf.endpoints[0].usagePlan = {
      usagePlanId: tempApigwConf.usagePlan.usagePlanId,
      usagePlanName: tempApigwConf.usagePlan.usagePlanName,
      usagePlanDesc: tempApigwConf.usagePlan.usagePlanDesc,
      maxRequestNum: tempApigwConf.usagePlan.maxRequestNum
    }
  }
  if (tempApigwConf.auth) {
    apigatewayConf.endpoints[0].auth = {
      secretName: tempApigwConf.auth.secretName,
      secretIds: tempApigwConf.auth.secretIds
    }
  }

  regionList.forEach((curRegion) => {
    const curRegionConf = inputs[curRegion]
    if (curRegionConf && curRegionConf.functionConf) {
      functionConf[curRegion] = curRegionConf.functionConf
    }
    if (curRegionConf && curRegionConf.apigatewayConf) {
      apigatewayConf[curRegion] = curRegionConf.apigatewayConf
    }
  })

  return {
    regionList,
    functionConf,
    apigatewayConf
  }
}

module.exports = {
  deepClone,
  generateId,
  mergeJson,
  capitalString,
  getDefaultProtocol,
  uploadCodeToCos,
  prepareInputs,
  prepareStaticCosInputs,
  prepareStaticCdnInputs
}
