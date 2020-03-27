[![Serverless Nextjs Tencent Cloud](https://img.serverlesscloud.cn/2020224/1582553715762-next.js_%E9%95%BF.png)](http://serverless.com)

&nbsp;

# Tencent Next.js Serverless Component

[![npm](https://img.shields.io/npm/v/%40serverless%2Ftencent-nextjs)](http://www.npmtrends.com/%40serverless%2Ftencent-nextjs)
[![NPM downloads](http://img.shields.io/npm/dm/%40serverless%2Ftencent-nextjs.svg?style=flat-square)](http://www.npmtrends.com/%40serverless%2Ftencent-nextjs)

[简体中文](https://github.com/serverless-components/tencent-nextjs/blob/master/README.md) | English

## Introduction

[Next.js](https://github.com/zeit/next.js) Serverless Component for Tencent Cloud.

## Content

0. [Prepare](#0-prepare)
1. [Install](#1-install)
1. [Create](#2-create)
1. [Configure](#3-configure)
1. [Deploy](#4-deploy)
1. [Remove](#5-Remove)

### 0. Prepare

#### Init Next.js Project

```bash
$ npm init next-app
```

Add `express` dependency：

```
$ npm i express --save
```

> Notice: using express for server of next.js.

### 1. Install

Install the Serverless Framework globally:

```bash
$ npm install -g serverless
```

### 2. Create

In project root, create the following simple boilerplate:

```bash
$ touch serverless.yml
$ touch .env           # your Tencent api keys
```

Add the access keys of a [Tencent CAM Role](https://console.cloud.tencent.com/cam/capi) with `AdministratorAccess` in the `.env` file, using this format:

```
# .env
TENCENT_SECRET_ID=XXX
TENCENT_SECRET_KEY=XXX
```

- If you don't have a Tencent Cloud account, you could [sign up](https://intl.cloud.tencent.com/register) first.

### 3. Configure

```yml
# serverless.yml
NextjsFunc:
  component: '@serverless/tencent-nextjs'
  inputs:
    functionName: nextjs-function
    region: ap-guangzhou
    runtime: Nodejs8.9
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

- [More Options](https://github.com/serverless-components/tencent-nextjs/blob/master/docs/configure.md)

### 4. Deploy

#### 4.1 Build static assets

```bash
$ npm run build
```

#### 4.2 Deploy to cloud

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

> Notice: `sls` is short for `serverless` command.

&nbsp;

### 5. Remove

```bash
$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Removed function nextjs-function successful
  DEBUG ─ Removing any previously deployed API. api-eimhu8pa
  DEBUG ─ Removing any previously deployed service. service-8knyukzy

  7s › NextjsFunc › done
```

### More Components

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
