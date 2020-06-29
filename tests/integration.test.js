const { generateId, getServerlessSdk } = require('./utils')
const execSync = require('child_process').execSync
const path = require('path')
const axios = require('axios')

// set enough timeout for deployment to finish
jest.setTimeout(50000)

// the yaml file we're testing against
const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'nextjs@dev',
  name: `nextjs-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    // region: 'ap-guangzhou'
  }
}

// get credentials from process.env but need to init empty credentials object
const credentials = {
  tencent: {}
}

// get serverless construct sdk
const sdk = getServerlessSdk(instanceYaml.org)

// clean up the instance after tests
afterAll(async () => {
  await sdk.remove(instanceYaml, credentials)
})

it('should successfully deploy nextjs app', async () => {
  const instance = await sdk.deploy(instanceYaml, { tencent: {} })
  expect(instance).toBeDefined()
  expect(instance.instanceName).toEqual(instanceYaml.name)
  // get src from template by default
  expect(instance.outputs.templateUrl).toBeDefined()
})

it('should successfully update basic configuration', async () => {
  instanceYaml.inputs.region = 'ap-shanghai'
  instanceYaml.inputs.runtime = 'Nodejs8.9'
  instanceYaml.inputs.functionName = 'nextjsDemoTest'

  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance.outputs).toBeDefined()
  expect(instance.outputs.region).toEqual(instanceYaml.inputs.region)
  expect(instance.outputs.scf).toBeDefined()
  expect(instance.outputs.scf.runtime).toEqual(instanceYaml.inputs.runtime)
  expect(instance.outputs.scf.functionName).toEqual(instanceYaml.inputs.functionName)
})

it('should successfully update apigatewayConf', async () => {
  instanceYaml.inputs.apigatewayConf = { environment: 'test' }
  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance.outputs).toBeDefined()
  expect(instance.outputs.apigw).toBeDefined()
  expect(instance.outputs.apigw.environment).toEqual(instanceYaml.inputs.apigatewayConf.environment)

})

it('should successfully update source code', async () => {
  // change source to own source './src' and need to install packages before deploy
  const srcPath = path.join(__dirname, 'src')
  execSync('npm install && npm run build', { cwd: srcPath })
  instanceYaml.inputs.src = srcPath

  const instance = await sdk.deploy(instanceYaml, credentials)
  const response = await axios.get(instance.outputs.apigw.url)

  expect(instance.outputs.templateUrl).not.toBeDefined()
  expect(response.data.includes('Test Nextjs')).toBeTruthy()
})

it('should successfully disable auto create api gateway', async () => {
  instanceYaml.inputs.apigatewayConf = { isDisabled: true }
  const instance = await sdk.deploy(instanceYaml, credentials)

  expect(instance.outputs).toBeDefined()
  expect(instance.outputs.apigw).not.toBeDefined()
})

it('should successfully remove nextjs app', async () => {
  await sdk.remove(instanceYaml, credentials)
  result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

  // remove action won't delete the service cause the apigw have the api binded
  expect(result.instance.instanceStatus).toEqual('inactive')
})