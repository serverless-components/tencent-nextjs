Object.defineProperty(exports, '__esModule', { value: true })
exports.ServerlessComponent = void 0
const core_1 = require('@serverless/core')
const tencent_component_toolkit_1 = require('tencent-component-toolkit')
const error_1 = require('tencent-component-toolkit/lib/utils/error')
const utils_1 = require('./utils')
const formatter_1 = require('./formatter')
const config_1 = require('./config')
const CONFIGS = config_1.getConfig()
class ServerlessComponent extends core_1.Component {
  getCredentials() {
    const { tmpSecrets } = this.credentials.tencent
    if (!tmpSecrets || !tmpSecrets.TmpSecretId) {
      throw new error_1.ApiTypeError(
        'CREDENTIAL',
        'Cannot get secretId/Key, your account could be sub-account and does not have the access to use SLS_QcsRole, please make sure the role exists first, then visit https://cloud.tencent.com/document/product/1154/43006, follow the instructions to bind the role to your account.'
      )
    }
    return {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
  }
  getAppId() {
    return this.credentials.tencent.tmpSecrets.appId
  }
  async uploadCodeToCos(appId, inputs, region) {
    var _a, _b, _c, _d, _e, _f
    const credentials = this.getCredentials()
    const bucketName =
      ((_a = inputs.code) === null || _a === void 0 ? void 0 : _a.bucket) ||
      `sls-cloudfunction-${region}-code`
    const objectName =
      ((_b = inputs.code) === null || _b === void 0 ? void 0 : _b.object) ||
      `${inputs.name}-${Math.floor(Date.now() / 1000)}.zip`
    // if set bucket and object not pack code
    if (
      !((_c = inputs.code) === null || _c === void 0 ? void 0 : _c.bucket) ||
      !((_d = inputs.code) === null || _d === void 0 ? void 0 : _d.object)
    ) {
      const zipPath = await utils_1.getCodeZipPath(inputs)
      console.log(`Code zip path ${zipPath}`)
      // save the zip path to state for lambda to use it
      this.state.zipPath = zipPath
      const cos = new tencent_component_toolkit_1.Cos(credentials, region)
      if (!((_e = inputs.code) === null || _e === void 0 ? void 0 : _e.bucket)) {
        // create default bucket
        await cos.deploy({
          bucket: bucketName + '-' + appId,
          force: true,
          lifecycle: [
            {
              status: 'Enabled',
              id: 'deleteObject',
              expiration: { days: '10' },
              abortIncompleteMultipartUpload: { daysAfterInitiation: '10' }
            }
          ]
        })
      }
      // upload code to cos
      if (!((_f = inputs.code) === null || _f === void 0 ? void 0 : _f.object)) {
        console.log(`Getting cos upload url for bucket ${bucketName}`)
        const uploadUrl = await cos.getObjectUrl({
          bucket: bucketName + '-' + appId,
          object: objectName,
          method: 'PUT'
        })
        // if shims and sls sdk entries had been injected to zipPath, no need to injected again
        console.log(`Uploading code to bucket ${bucketName}`)
        const { injectFiles, injectDirs } = utils_1.getInjection(this, inputs)
        await this.uploadSourceZipToCOS(zipPath, uploadUrl, injectFiles, injectDirs)
        console.log(`Upload ${objectName} to bucket ${bucketName} success`)
      }
    }
    // save bucket state
    this.state.bucket = bucketName
    this.state.object = objectName
    return {
      bucket: bucketName,
      object: objectName
    }
  }
  async deployFunction(credentials, inputs = {}, region) {
    var _a, _b, _c, _d
    const appId = this.getAppId()
    const code = await this.uploadCodeToCos(appId, inputs, region)
    const scf = new tencent_component_toolkit_1.Scf(credentials, region)
    const tempInputs = Object.assign(Object.assign({}, inputs), { code })
    const scfOutput = await scf.deploy(utils_1.deepClone(tempInputs))
    const outputs = {
      functionName: scfOutput.FunctionName,
      runtime: scfOutput.Runtime,
      namespace: scfOutput.Namespace
    }
    this.state = Object.assign(Object.assign({}, this.state), outputs)
    // default version is $LATEST
    outputs.lastVersion =
      (_b =
        (_a = scfOutput.LastVersion) !== null && _a !== void 0 ? _a : this.state.lastVersion) !==
        null && _b !== void 0
        ? _b
        : '$LATEST'
    // default traffic is 1.0, it can also be 0, so we should compare to undefined
    outputs.traffic =
      (_d = (_c = scfOutput.Traffic) !== null && _c !== void 0 ? _c : this.state.traffic) !==
        null && _d !== void 0
        ? _d
        : 1
    if (outputs.traffic !== 1 && scfOutput.ConfigTrafficVersion) {
      outputs.configTrafficVersion = scfOutput.ConfigTrafficVersion
      this.state.configTrafficVersion = scfOutput.ConfigTrafficVersion
    }
    this.state.lastVersion = outputs.lastVersion
    this.state.traffic = outputs.traffic
    return outputs
  }
  async deployApigw(credentials, inputs, region) {
    var _a, _b
    const { state } = this
    const serviceId =
      (_a = inputs.serviceId) !== null && _a !== void 0 ? _a : state && state.serviceId
    const apigw = new tencent_component_toolkit_1.Apigw(credentials, region)
    const oldState = (_b = this.state) !== null && _b !== void 0 ? _b : {}
    const apigwInputs = Object.assign(Object.assign({}, inputs), {
      oldState: {
        apiList: oldState.apiList || [],
        customDomains: oldState.customDomains || []
      }
    })
    // different region deployment has different service id
    apigwInputs.serviceId = serviceId
    const apigwOutput = await apigw.deploy(utils_1.deepClone(apigwInputs))
    const outputs = {
      serviceId: apigwOutput.serviceId,
      subDomain: apigwOutput.subDomain,
      environment: apigwOutput.environment,
      url: `${utils_1.getDefaultProtocol(inputs.protocols)}://${apigwOutput.subDomain}/${
        apigwOutput.environment
      }${apigwInputs.endpoints[0].path}`
    }
    if (apigwOutput.customDomains) {
      outputs.customDomains = apigwOutput.customDomains
    }
    this.state = Object.assign(Object.assign(Object.assign({}, this.state), outputs), {
      apiList: apigwOutput.apiList,
      created: true
    })
    return outputs
  }
  // deploy static to cos, and setup cdn
  async deployStatic(inputs, region) {
    const credentials = this.getCredentials()
    const { zipPath } = this.state
    const appId = this.getAppId()
    const deployStaticOutputs = {
      cos: {
        region: '',
        cosOrigin: ''
      }
    }
    if (zipPath) {
      console.log(`Deploying static files`)
      // 1. deploy to cos
      const { staticCosInputs, bucket, policy } = await formatter_1.formatStaticCosInputs(
        inputs.cosConf,
        appId,
        zipPath,
        region
      )
      const cos = new tencent_component_toolkit_1.Cos(credentials, region)
      const cosOutput = {
        region,
        bucket,
        cosOrigin: `${bucket}.cos.${region}.myqcloud.com`,
        url: `https://${bucket}.cos.${region}.myqcloud.com`
      }
      // try to create bucket
      await cos.createBucket({
        bucket,
        force: true
      })
      // set public access policy
      await cos.setPolicy({
        bucket,
        policy
      })
      // 创建 COS 桶后等待1s，防止偶发出现桶不存在错误
      await utils_1.sleep(1000)
      // flush bucket
      if (inputs.cosConf.replace) {
        await cos.flushBucketFiles(bucket)
        try {
        } catch (e) {}
      }
      for (let i = 0; i < staticCosInputs.length; i++) {
        const curInputs = staticCosInputs[i]
        console.log(`Starting upload directory ${curInputs.src} to cos bucket ${curInputs.bucket}`)
        await cos.upload({
          bucket,
          dir: curInputs.src,
          keyPrefix: curInputs.keyPrefix
        })
        console.log(`Upload directory ${curInputs.src} to cos bucket ${curInputs.bucket} success`)
      }
      deployStaticOutputs.cos = cosOutput
      // 2. deploy cdn
      if (inputs.cdnConf) {
        const cdn = new tencent_component_toolkit_1.Cdn(credentials)
        const cdnInputs = await formatter_1.formatStaticCdnInputs(
          inputs.cdnConf,
          cosOutput.cosOrigin
        )
        console.log(`Starting deploy cdn ${cdnInputs.domain}`)
        const cdnDeployRes = await cdn.deploy(cdnInputs)
        const protocol = cdnInputs.https ? 'https' : 'http'
        const cdnOutput = {
          domain: cdnDeployRes.domain,
          url: `${protocol}://${cdnDeployRes.domain}`,
          cname: cdnDeployRes.cname
        }
        deployStaticOutputs.cdn = cdnOutput
        console.log(`Deploy cdn ${cdnInputs.domain} success`)
      }
      console.log(`Deployed static files success`)
      return deployStaticOutputs
    }
    return null
  }
  async deploy(inputs) {
    var _a
    console.log(`Deploying ${CONFIGS.framework} application`)
    const credentials = this.getCredentials()
    // 对Inputs内容进行标准化
    const { region, functionConf, apigatewayConf } = await formatter_1.formatInputs(
      this.state,
      inputs
    )
    // 部署函数 + API网关
    const outputs = {}
    if (!((_a = functionConf.code) === null || _a === void 0 ? void 0 : _a.src)) {
      outputs.templateUrl = CONFIGS.templateUrl
    }
    let apigwOutputs
    const functionOutputs = await this.deployFunction(credentials, functionConf, region)
    // support apigatewayConf.isDisabled
    if (apigatewayConf.isDisabled !== true) {
      apigwOutputs = await this.deployApigw(credentials, apigatewayConf, region)
    } else {
      this.state.apigwDisabled = true
    }
    // optimize outputs for one region
    outputs.region = region
    outputs.scf = functionOutputs
    if (apigwOutputs) {
      outputs.apigw = apigwOutputs
    }
    // start deploy static cdn
    if (inputs.staticConf) {
      const { staticConf } = inputs
      const res = await this.deployStatic(staticConf, region)
      if (res) {
        this.state.staticConf = res
        outputs.staticConf = res
      }
    }
    this.state.region = region
    this.state.lambdaArn = functionConf.name
    return outputs
  }
  async removeStatic() {
    // remove static
    const { region, staticConf } = this.state
    if (staticConf) {
      console.log(`Removing static files`)
      const credentials = this.getCredentials()
      // 1. remove cos
      if (staticConf.cos) {
        const { cos: cosState } = staticConf
        if (cosState.bucket) {
          const { bucket } = cosState
          const cos = new tencent_component_toolkit_1.Cos(credentials, region)
          await cos.remove({ bucket })
        }
      }
      // 2. remove cdn
      if (staticConf.cdn) {
        const cdn = new tencent_component_toolkit_1.Cdn(credentials)
        try {
          await cdn.remove(staticConf.cdn)
        } catch (e) {
          // no op
        }
      }
      console.log(`Remove static config success`)
    }
  }
  async remove() {
    console.log(`Removing application`)
    const { state } = this
    const { region } = state
    const {
      namespace,
      functionName,
      created,
      serviceId,
      apigwDisabled,
      customDomains,
      apiList,
      environment
    } = state
    const credentials = this.getCredentials()
    // if disable apigw, no need to remove
    if (apigwDisabled !== true && serviceId) {
      const apigw = new tencent_component_toolkit_1.Apigw(credentials, region)
      await apigw.remove({
        created,
        environment,
        serviceId,
        apiList,
        customDomains
      })
    }
    if (functionName) {
      const scf = new tencent_component_toolkit_1.Scf(credentials, region)
      await scf.remove({
        functionName,
        namespace
      })
    }
    // remove static
    await this.removeStatic()
    this.state = {}
  }
  async metrics(inputs = {}) {
    console.log(`Getting metrics data`)
    if (!inputs.rangeStart || !inputs.rangeEnd) {
      throw new error_1.ApiTypeError(
        `PARAMETER_${CONFIGS.framework.toUpperCase()}_METRICS`,
        'rangeStart and rangeEnd are require inputs'
      )
    }
    const { state } = this
    const { region } = state
    if (!region) {
      throw new error_1.ApiTypeError(
        `PARAMETER_${CONFIGS.framework.toUpperCase()}_METRICS`,
        'No region property in state'
      )
    }
    const { functionName, namespace } = state
    if (functionName) {
      const options = {
        funcName: functionName,
        namespace: namespace,
        region,
        timezone: inputs.tz
      }
      if (state.serviceId) {
        options.apigwServiceId = state.serviceId
        options.apigwEnvironment = state.environment || 'release'
      }
      const credentials = this.getCredentials()
      const mertics = new tencent_component_toolkit_1.Metrics(credentials, options)
      const metricResults = await mertics.getDatas(
        inputs.rangeStart,
        inputs.rangeEnd,
        tencent_component_toolkit_1.Metrics.Type.All
      )
      return metricResults
    }
    throw new error_1.ApiTypeError(
      `PARAMETER_${CONFIGS.framework.toUpperCase()}_METRICS`,
      'Function name not define'
    )
  }
}
exports.ServerlessComponent = ServerlessComponent
