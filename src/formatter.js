Object.defineProperty(exports, '__esModule', { value: true })
exports.formatInputs = exports.formatStaticCdnInputs = exports.formatStaticCosInputs = void 0
const AdmZip = require('adm-zip')
const error_1 = require('tencent-component-toolkit/lib/utils/error')
const config_1 = require('./config')
const CONFIGS = config_1.getConfig()
const utils_1 = require('./utils')
const formatStaticCosInputs = async (cosConf, appId, codeZipPath, region) => {
  try {
    const staticCosInputs = []
    const sources = cosConf.sources || CONFIGS.defaultStatics
    const { bucket } = cosConf
    // 删除用户填写时携带的 appid
    const bucketName = utils_1.removeAppid(bucket, appId)
    const staticPath = `/tmp/${utils_1.generateId()}`
    const codeZip = new AdmZip(codeZipPath)
    const entries = codeZip.getEntries()
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
          protocol: 'https',
          bucket: `${bucketName}-${appId}`,
          src: `${staticPath}/${entryName}`,
          keyPrefix: curSource.targetDir || '/'
        }
        staticCosInputs.push(cosInputs)
      }
    }
    return {
      bucket: `${bucketName}-${appId}`,
      staticCosInputs,
      // 通过设置 policy 来支持公网访问
      policy: CONFIGS.getPolicy(region, `${bucketName}-${appId}`, appId)
    }
  } catch (e) {
    throw new error_1.ApiTypeError(
      `UTILS_${CONFIGS.framework.toUpperCase()}_prepareStaticCosInputs`,
      e.message,
      e.stack
    )
  }
}
exports.formatStaticCosInputs = formatStaticCosInputs
const formatStaticCdnInputs = async (cdnConf, origin) => {
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
    onlyRefresh: cdnConf.onlyRefresh
  }
  if (cdnConf.https) {
    // 通过提供默认的配置来简化用户配置
    cdnInputs.forceRedirect = cdnConf.forceRedirect || CONFIGS.defaultCdnConfig.forceRedirect
    if (!cdnConf.https.certId) {
      throw new error_1.ApiTypeError(
        `PARAMETER_${CONFIGS.framework.toUpperCase()}_HTTPS`,
        'https.certId is required'
      )
    }
    cdnInputs.https = Object.assign(Object.assign({}, CONFIGS.defaultCdnConfig.https), {
      http2: cdnConf.https.http2 || 'on',
      certInfo: {
        certId: cdnConf.https.certId
      }
    })
  }
  if (cdnConf.autoRefresh !== false) {
    cdnInputs.refreshCdn = {
      flushType: cdnConf.refreshType || 'delete',
      urls: [`http://${cdnInputs.domain}`, `https://${cdnInputs.domain}`]
    }
  }
  return cdnInputs
}
exports.formatStaticCdnInputs = formatStaticCdnInputs
const formatInputs = (state, inputs = {}) => {
  var _a,
    _b,
    _c,
    _d,
    _e,
    _f,
    _g,
    _h,
    _j,
    _k,
    _l,
    _m,
    _o,
    _p,
    _q,
    _r,
    _s,
    _t,
    _u,
    _v,
    _w,
    _x,
    _y,
    _z,
    _0,
    _1,
    _2,
    _3,
    _4,
    _5,
    _6,
    _7,
    _8,
    _9,
    _10,
    _11,
    _12,
    _13
  // 标准化函数参数
  const tempFunctionConf = (_a = inputs.functionConf) !== null && _a !== void 0 ? _a : {}
  const region = (_b = inputs.region) !== null && _b !== void 0 ? _b : 'ap-guangzhou'
  // 获取状态中的函数名称
  const regionState = state[region]
  const stateFunctionName = state.functionName || (regionState && regionState.funcitonName)
  const functionConf = Object.assign(tempFunctionConf, {
    code: {
      src: inputs.src,
      bucket:
        (_c = inputs === null || inputs === void 0 ? void 0 : inputs.srcOriginal) === null ||
        _c === void 0
          ? void 0
          : _c.bucket,
      object:
        (_d = inputs === null || inputs === void 0 ? void 0 : inputs.srcOriginal) === null ||
        _d === void 0
          ? void 0
          : _d.object
    },
    name:
      (_g =
        (_f = (_e = tempFunctionConf.name) !== null && _e !== void 0 ? _e : inputs.functionName) !==
          null && _f !== void 0
          ? _f
          : stateFunctionName) !== null && _g !== void 0
        ? _g
        : utils_1.getDefaultFunctionName(),
    region: region,
    role:
      (_j = (_h = tempFunctionConf.role) !== null && _h !== void 0 ? _h : inputs.role) !== null &&
      _j !== void 0
        ? _j
        : '',
    handler:
      (_l = (_k = tempFunctionConf.handler) !== null && _k !== void 0 ? _k : inputs.handler) !==
        null && _l !== void 0
        ? _l
        : CONFIGS.handler,
    runtime:
      (_o = (_m = tempFunctionConf.runtime) !== null && _m !== void 0 ? _m : inputs.runtime) !==
        null && _o !== void 0
        ? _o
        : CONFIGS.runtime,
    namespace:
      (_q = (_p = tempFunctionConf.namespace) !== null && _p !== void 0 ? _p : inputs.namespace) !==
        null && _q !== void 0
        ? _q
        : CONFIGS.namespace,
    description:
      (_s =
        (_r = tempFunctionConf.description) !== null && _r !== void 0 ? _r : inputs.description) !==
        null && _s !== void 0
        ? _s
        : CONFIGS.description,
    layers:
      (_u = (_t = tempFunctionConf.layers) !== null && _t !== void 0 ? _t : inputs.layers) !==
        null && _u !== void 0
        ? _u
        : [],
    cfs: (_v = tempFunctionConf.cfs) !== null && _v !== void 0 ? _v : [],
    publish: tempFunctionConf.publish || inputs.publish,
    traffic: tempFunctionConf.traffic || inputs.traffic,
    lastVersion: state.lastVersion,
    timeout: (_w = tempFunctionConf.timeout) !== null && _w !== void 0 ? _w : CONFIGS.timeout,
    memorySize:
      (_x = tempFunctionConf.memorySize) !== null && _x !== void 0 ? _x : CONFIGS.memorySize,
    tags:
      (_z = (_y = tempFunctionConf.tags) !== null && _y !== void 0 ? _y : inputs.tags) !== null &&
      _z !== void 0
        ? _z
        : null
  })
  if (!((_0 = functionConf.environment) === null || _0 === void 0 ? void 0 : _0.variables)) {
    functionConf.environment = {
      variables: {}
    }
  }
  // 添加框架需要添加的默认环境变量
  const { defaultEnvs } = CONFIGS
  defaultEnvs.forEach((item) => {
    functionConf.environment.variables[item.key] = item.value
  })
  // 添加入口文件环境变量
  const entryFile = functionConf.entryFile || inputs.entryFile || CONFIGS.defaultEntryFile
  if (entryFile) {
    functionConf.environment.variables['SLS_ENTRY_FILE'] = entryFile
  }
  // django 项目需要 projectName 参数
  if (CONFIGS.framework === 'django') {
    functionConf.projectName =
      (_3 =
        (_2 =
          (_1 = tempFunctionConf.projectName) !== null && _1 !== void 0
            ? _1
            : tempFunctionConf.djangoProjectName) !== null && _2 !== void 0
          ? _2
          : inputs.djangoProjectName) !== null && _3 !== void 0
        ? _3
        : ''
  }
  // TODO: 验证流量配置，将废弃
  if (inputs.traffic !== undefined) {
    utils_1.validateTraffic(inputs.traffic)
  }
  // TODO: 判断是否需要配置流量，将废弃
  functionConf.needSetTraffic = inputs.traffic !== undefined && functionConf.lastVersion
  // 初始化 VPC 配置，兼容旧的vpc配置
  const vpc = tempFunctionConf.vpcConfig || tempFunctionConf.vpc || inputs.vpcConfig || inputs.vpc
  if (vpc) {
    functionConf.vpcConfig = vpc
  }
  //  标准化网关配置参数
  const tempApigwConf = (_4 = inputs.apigatewayConf) !== null && _4 !== void 0 ? _4 : {}
  const apigatewayConf = Object.assign(tempApigwConf, {
    serviceId:
      (_6 = (_5 = tempApigwConf.serviceId) !== null && _5 !== void 0 ? _5 : tempApigwConf.id) !==
        null && _6 !== void 0
        ? _6
        : inputs.serviceId,
    region: region,
    isDisabled: tempApigwConf.isDisabled === true,
    serviceName:
      (_9 =
        (_8 =
          (_7 = tempApigwConf.serviceName) !== null && _7 !== void 0 ? _7 : tempApigwConf.name) !==
          null && _8 !== void 0
          ? _8
          : inputs.serviceName) !== null && _9 !== void 0
        ? _9
        : utils_1.getDefaultServiceName(),
    serviceDesc:
      (_11 =
        (_10 = tempApigwConf.serviceDesc) !== null && _10 !== void 0
          ? _10
          : tempApigwConf.description) !== null && _11 !== void 0
        ? _11
        : utils_1.getDefaultServiceDescription(),
    protocols: tempApigwConf.protocols || ['http'],
    environment: tempApigwConf.environment ? tempApigwConf.environment : 'release',
    customDomains: tempApigwConf.customDomains || []
  })
  // 如果没配置，添加默认的 API 配置，通常 Web 框架组件是不要用户自定义的
  if (!apigatewayConf.endpoints) {
    apigatewayConf.endpoints = [
      {
        path: tempApigwConf.path || '/',
        enableCORS:
          (_12 = tempApigwConf.enableCORS) !== null && _12 !== void 0 ? _12 : tempApigwConf.cors,
        serviceTimeout:
          (_13 = tempApigwConf.serviceTimeout) !== null && _13 !== void 0
            ? _13
            : tempApigwConf.timeout,
        method: tempApigwConf.method || 'ANY',
        apiName: tempApigwConf.apiName || 'index',
        isBase64Encoded: tempApigwConf.isBase64Encoded,
        function: {
          isIntegratedResponse: true,
          functionName: functionConf.name,
          functionNamespace: functionConf.namespace,
          functionQualifier:
            (tempApigwConf.function && tempApigwConf.function.functionQualifier) ||
            apigatewayConf.qualifier ||
            '$DEFAULT'
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
  return {
    region,
    functionConf,
    apigatewayConf
  }
}
exports.formatInputs = formatInputs
