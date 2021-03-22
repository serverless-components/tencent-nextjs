⚠️⚠️⚠️ 所有框架组件项目迁移到 [tencent-framework-components](https://github.com/serverless-components/tencent-framework-components).

[![Serverless Nextjs Tencent Cloud](https://img.serverlesscloud.cn/2020224/1582553715762-next.js_%E9%95%BF.png)](http://serverless.com)

&nbsp;

# 腾讯云 Next.js Serverless Component

## 简介

**腾讯云[Next.js](https://github.com/zeit/next.js) 组件** - 通过使用[**Tencent Serverless Framework**](https://github.com/serverless/components/tree/cloud) , 基于云上 Serverless 服务（如 API 网关、云函数等），实现“0”配置，便捷开发，极速部署采用 Next.js 框架的网页应用，Next.js 组件支持丰富的配置扩展，提供了目前便捷实用，开发成本低的网页应用项目的开发/托管能力。

特性介绍：

- [x] **按需付费** - 按照请求的使用量进行收费，没有请求时无需付费
- [x] **"0"配置** - 只需要关心项目代码，之后部署即可，Serverless Framework 会搞定所有配置。
- [x] **极速部署** - 部署速度快，仅需几秒，部署你的整个应用。
- [x] **实时日志** - 通过实时日志的输出查看业务状态，便于直接在云端开发应用。
- [x] **云端调试** - 可在云端直接进行项目调试，从而避免本地环境的差异。
- [x] **便捷协作** - 通过云端控制台的状态信息和部署日志，方便进行多人协作开发。

## 快速开始

0. [**准备**](#0-准备)
1. [**安装**](#1-安装)
1. [**配置**](#2-配置)
1. [**部署**](#3-部署)
1. [**开发调试**](#4-开发调试)
1. [**查看状态**](#5-查看部署状态)
1. [**移除**](#6-移除)

更多资源：

- [**账号配置**](#账号配置)
- [**架构说明**](#架构说明)
- [**更多组件**](#更多组件)
- [**FAQ**](#FAQ)

### 1. 安装

通过 npm 全局安装 [serverless cli](https://github.com/serverless/serverless)

```bash
$ npm install -g serverless
```

### 2. 创建

通过如下命令和模板链接，快速创建一个 Next.js 应用：

```bash
$ serverless init nextjs-starter --name example
$ cd example
```

### 3. 部署

在 `serverless.yml` 文件所在的项目根目录，运行以下指令，将会弹出二维码，直接扫码授权进行部署：

```
serverless deploy
```

> **说明**：如果鉴权失败，请参考 [权限配置](https://cloud.tencent.com/document/product/1154/43006) 进行授权。

### 4. 配置

nextjs 组件支持 0 配置部署，也就是可以直接通过配置文件中的默认值进行部署。但你依然可以修改更多可选配置来进一步开发该 nextjs 项目。

以下是 nextjs 组件的 `serverless.yml`配置示例：

```yml
# serverless.yml
component: nextjs # (必填) 组件名称，此处为nextjs
name: nextjsDemo # (必填) 实例名称
org: orgDemo # (可选) 用于记录组织信息，默认值为您的腾讯云账户 appid
app: appDemo # (可选) 该 next.js 应用名称
stage: dev # (可选) 用于区分环境信息，默认值是 dev

inputs:
  src:
    src: ./
    exclude:
      - .env
  functionName: nextjsDemo
  region: ap-guangzhou
  runtime: Nodejs10.15
  apigatewayConf:
    protocols:
      - http
      - https
    environment: release
```

- 点此查看[更多配置及说明](/docs/configure.md)

### 5. 开发调试

部署了 Next.js 应用后，可以通过开发调试能力对该项目进行二次开发，从而开发一个生产应用。在本地修改和更新代码后，不需要每次都运行 `serverless deploy` 命令来反复部署。你可以直接通过 `serverless dev` 命令对本地代码的改动进行检测和自动上传。

可以通过在 `serverless.yml`文件所在的目录下运行 `serverless dev` 命令开启开发调试能力。

`serverless dev` 同时支持实时输出云端日志，每次部署完毕后，对项目进行访问，即可在命令行中实时输出调用日志，便于查看业务情况和排障。

### 6. 查看部署状态

在`serverless.yml`文件所在的目录下，通过如下命令查看部署状态：

```
$ serverless info
```

### 6. 移除

在`serverless.yml`文件所在的目录下，通过以下命令移除部署通过以下命令移除部署的 API 网关，移除后该组件会对应删除云上部署时所创建的所有相关资源。

```bash
$ serverless remove
```

和部署类似，支持通过 `serverless remove --debug` 命令查看移除过程中的实时日志信息。

### 账号配置

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

> 注意：海外 ip 登录时，需要在`.env`文件中添加`SERVERLESS_PLATFORM_VENDOR=tencent` ，使 serverless 默认使用 tencent 组件

## 架构说明

Next.js 组件将在腾讯云账户中使用到如下 Serverless 服务：

- [x] **API 网关** - API 网关将会接收外部请求并且转发到 SCF 云函数中。
- [x] **SCF 云函数** - 云函数将承载 Next.js 应用。
- [x] **CAM 访问控制** - 该组件会创建默认 CAM 角色用于授权访问关联资源。
- [x] **COS 对象存储** - 为确保上传速度和质量，云函数压缩并上传代码时，会默认将代码包存储在特定命名的 COS 桶中
- [x] **SSL 证书服务** - 如果你在 yaml 文件中配置了 `apigatewayConf.customDomains` 字段，需要做自定义域名绑定并开启 HTTPS 时，也会用到证书管理服务和域名服务。Serverless Framework 会根据已经备案的域名自动申请并配置 SSL 证书。

## 更多组件

可以在 [Serverless Components](https://github.com/serverless/components) 仓库中查询更多组件的信息。

## 项目迁移

如果项目使用了自定义 Node.js 服务，比如 express 或者 koa，你需要做如下改造工作。

### 自定义 express 服务

如果你的 Next.js 项目本身运行就是基于 `express` 自定义服务的，那么你需要在项目中自定义入口文件 `sls.js`，需要参考你的服务启动文件进行修改，以下是一个模板文件：

```js
const express = require('express')
const next = require('next')

// not report route for custom monitor
const noReportRoutes = ['/_next', '/static', '/favicon.ico']

async function createServer() {
  const app = next({ dev: false })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = express()
  server.all('*', (req, res) => {
    noReportRoutes.forEach((route) => {
      if (req.path.indexOf(route) !== -1) {
        req.__SLS_NO_REPORT__ = true
      }
    })
    return handle(req, res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = ['*/*']

  return server
}

module.exports = createServer
```

### 自定义 koa 服务

如果你的项目使用的是 Koa 作为 Node.js 服务，需要在项目中自定义入口文件 `sls.js`，需要参考你的服务启动文件进行修改，以下是一个模板文件：

```js
const Koa = require('koa')
const next = require('next')

async function createServer() {
  const app = next({ dev: false })
  const handle = app.getRequestHandler()

  const server = new Koa()
  server.use((ctx) => {
    ctx.status = 200
    ctx.respond = false
    ctx.req.ctx = ctx

    return handle(ctx.req, ctx.res)
  })

  // define binary type for response
  // if includes, will return base64 encoded, very useful for images
  server.binaryTypes = ['*/*']

  return server
}

module.exports = createServer
```

## 自定义监控

当在部署 Next.js 应用时，如果 `serverless.yml` 中未指定 `role`，默认会尝试绑定 `QCS_SCFExcuteRole`，并且开启自定义监控，帮助用户收集应用监控指标。对于为自定义入口文件的项目，会默认上报除含有 `/_next`、`/static` 和 `/favicon.ico` 的路由。如果你想自定义上报自己的路由性能，那么可以自定义 `sls.js` 入口文件，对于无需上报的路由，在 express 服务的 `req` 对象上添加 `__SLS_NO_REPORT__` 属性值为 `true` 即可。比如：

```js
server.get('/no-report', (req, res) => {
  req.__SLS_NO_REPORT__ = true
  return handle(req, res)
})
```

那么用户在访问 `GET /no-report` 路由时，就不会上报自定义监控指标。

## 文件上传

[文件上传教程](https://github.com/serverless-components/tencent-nextjs/tree/master/docs/upload.md)

## License

MIT License

Copyright (c) 2020 Tencent Cloud, Inc.
