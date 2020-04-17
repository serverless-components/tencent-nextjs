[![Serverless Nextjs Tencent Cloud](https://img.serverlesscloud.cn/2020224/1582553715762-next.js_%E9%95%BF.png)](http://serverless.com)

&nbsp;

# Tencent Next.js Serverless Component

[简体中文](https://github.com/serverless-components/tencent-nextjs/blob/v2/README.md) | English

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
component: nextjs
name: nextjsDemo
org: orgDemo
app: appDemo
stage: dev

inputs:
  src: ./src
  functionName: nextjsDemo
  region: ap-guangzhou
  runtime: Nodejs10.15
  exclude:
    - .env
  apigatewayConf:
    protocols:
      - http
      - https
    environment: release
```

- [More Options](https://github.com/serverless-components/tencent-nextjs/blob/v2/docs/configure.md)

### 4. Deploy

#### 4.1 Build static assets

```bash
$ npm run build
```

#### 4.2 Deploy to cloud

```bash
$ sls deploy
```

> Notice: `sls` is short for `serverless` command.

&nbsp;

### 5. Remove

```bash
$ sls remove
```

### More Components

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
