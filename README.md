[![Serverless Nextjs Tencent Cloud](https://img.serverlesscloud.cn/2020224/1582553715762-next.js_%E9%95%BF.png)](http://serverless.com)

&nbsp;

# 腾讯云 Next.js Serverless Component

[![npm](https://img.shields.io/npm/v/%40serverless%2Ftencent-nextjs)](http://www.npmtrends.com/%40serverless%2Ftencent-nextjs)
[![NPM downloads](http://img.shields.io/npm/dm/%40serverless%2Ftencent-nextjs.svg?style=flat-square)](http://www.npmtrends.com/%40serverless%2Ftencent-nextjs)

简体中文 | [English](https://github.com/serverless-components/tencent-nextjs/blob/master/README.en.md)

## 简介

腾讯云 [Next.js](https://github.com/zeit/next.js) Serverless Component。

## 目录

0. [准备](#0-准备)
1. [安装](#1-安装)
1. [配置](#2-配置)
1. [部署](#3-部署)
1. [移除](#4-移除)

### 0. 准备

#### 初始化 Next.js 项目

```bash
$ npm init next-app
```

添加 `express` 依赖：

```
$ npm i express --save
```

> 注释：这里通过 express 服务来代理 next.js 的服务。

### 1. 安装

通过 npm 全局安装 [serverless cli](https://github.com/serverless/serverless)

```bash
$ npm install -g serverless
```

### 2. 配置

在项目根目录创建 `serverless.yml` 文件，在其中进行如下配置

```bash
$ touch serverless.yml
```

```yml
# serverless.yml
NextjsFunc:
  component: '@serverless/tencent-nextjs'
  inputs:
    functionName: nextjs-function
    region: ap-guangzhou
    code: ./
    functionConf:
      timeout: 30
      memorySize: 128
    environment:
      variables:
        RUN_ENV: test
    apigatewayConf:
      protocols:
        - http
        - https
      environment: release
```

- [更多配置](https://github.com/serverless-components/tencent-nextjs/tree/master/docs/configure.md)

### 3. 部署

#### 3.1 构建静态资源

```bash
$ npm run build
```

#### 3.2 部署到云端

如您的账号未 [登陆](https://cloud.tencent.com/login) 或 [注册](https://cloud.tencent.com/register) 腾讯云，您可以直接通过 `微信` 扫描命令行中的二维码进行授权登陆和注册。

通过 `sls` 命令进行部署，并可以添加 `--debug` 参数查看部署过程中的信息

```bash
$ sls --debug

  DEBUG ─ Resolving the template's static variables.
  DEBUG ─ Collecting components from the template.
  DEBUG ─ Downloading any NPM components found in the template.
  DEBUG ─ Analyzing the template's components dependencies.
  DEBUG ─ Creating the template's components graph.
  DEBUG ─ Syncing template state.
  DEBUG ─ Executing the template's components graph.
  DEBUG ─ Generating serverless handler...
  DEBUG ─ Generated serverless handler successfully.
  DEBUG ─ Compressing function nextjs-function file to /Users/yugasun/Desktop/Develop/serverless/tencent-nextjs/example/.serverless/nextjs-function.zip.
  DEBUG ─ Compressed function nextjs-function file successful
  DEBUG ─ Uploading service package to cos[sls-cloudfunction-ap-guangzhou-code]. sls-cloudfunction-default-nextjs-function-1584351212.zip
  DEBUG ─ Uploaded package successful /Users/yugasun/Desktop/Develop/serverless/tencent-nextjs/example/.serverless/nextjs-function.zip
  DEBUG ─ Creating function nextjs-function
  nextjs-function [████████████████████████████████████████] 100% | ETA: 0s | Speed: 1039.75k/s
  DEBUG ─ Created function nextjs-function successful
  DEBUG ─ Setting tags for function nextjs-function
  DEBUG ─ Creating trigger for function nextjs-function
  DEBUG ─ Deployed function nextjs-function successful
  DEBUG ─ Starting API-Gateway deployment with name ap-guangzhou-apigateway in the ap-guangzhou region
  DEBUG ─ Service with ID service-8knyukzy created.
  DEBUG ─ API with id api-eimhu8pa created.
  DEBUG ─ Deploying service with id service-8knyukzy.
  DEBUG ─ Deployment successful for the api named ap-guangzhou-apigateway in the ap-guangzhou region.

  NextjsFunc:
    functionName:        nextjs-function
    functionOutputs:
      ap-guangzhou:
        Name:        nextjs-function
        Runtime:     Nodejs8.9
        Handler:     serverless-handler.handler
        MemorySize:  128
        Timeout:     30
        Region:      ap-guangzhou
        Namespace:   default
        Description: This is a template function
    region:              ap-guangzhou
    apiGatewayServiceId: service-8knyukzy
    url:                 https://service-8knyukzy-1251556596.gz.apigw.tencentcs.com/release/
    cns:                 (empty array)

  33s › NextjsFunc › done
```

> 注意: `sls` 是 `serverless` 命令的简写。

### 4. 移除

通过以下命令移除部署的 API 网关

```bash
$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Removed function nextjs-function successful
  DEBUG ─ Removing any previously deployed API. api-eimhu8pa
  DEBUG ─ Removing any previously deployed service. service-8knyukzy

  7s › NextjsFunc › done
```

### 账号配置（可选）

当前默认支持 CLI 扫描二维码登录，如您希望配置持久的环境变量/秘钥信息，也可以本地创建 `.env` 文件

```bash
$ touch .env # 腾讯云的配置信息
```

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存

如果没有腾讯云账号，可以在此 [注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 中获取 `SecretId` 和`SecretKey`.

```text
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```

### 更多组件

可以在 [Serverless Components](https://github.com/serverless/components) repo 中查询更多组件的信息。

### FAQ

1. [为什么不需要入口文件了？](https://github.com/serverless-components/tencent-nextjs/issues/1)
