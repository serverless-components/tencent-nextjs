# Tencent Next.js Serverless Component

[简体中文](https://github.com/serverless-components/tencent-nextjs/blob/master/README.md) | English

## Introduction

[Next.js](https://github.com/eggjs/egg) Serverless Component for Tencent Cloud, support Restful API deploy.

## Content

1. [Prepare](#0-prepare)
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

#### Add init file

Create `sls.js` file in project root, as below:

```js
const express = require('express');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

async function creatServer() {
  await app.prepare();
  const server = express()

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = [
    '*/*',
  ]

  return server
}

module.exports = creatServer
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

MyComponent:
  component: '@serverless/tencent-nextjs'
  inputs:
    region: ap-guangzhou
    functionName: egg-function
    code: ./
    functionConf:
      timeout: 10
      memorySize: 128
      environment:
        variables:
          TEST: vale
      vpcConfig:
        subnetId: ''
        vpcId: ''
    apigatewayConf:
      protocols:
        - https
      environment: release
```

- [More Options](https://github.com/serverless-components/tencent-nextjs/blob/master/docs/configure.md)

### 4. Deploy

```bash
$ sls --debug
```

> Notice: `sls` is short for `serverless` command.

&nbsp;

### 5. Remove

```bash
$ sls remove --debug
```

### More Components

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
