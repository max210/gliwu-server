import Koa from 'koa'
import http from 'http'
import json from 'koa-json'
import cors from 'koa2-cors'
import socket from 'socket.io'
import logger from 'koa-logger'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'

import goodModel from './models/good'
import userModel from './models/user'
import mongooseInit from './models/init'
import good from './routers/good'
import user from './routers/user'
import config  from './config'
import socketListen from './controllers/socket'

const app = new Koa()

// socket.io
const server = http.createServer(app.callback())
const io = socket(server)
socketListen(io)

//mongoose初始化
;(async () => {
  await mongooseInit()
})()

onerror(app)

//加密cookie 指定加密短语
app.keys = ['cookie_secret1', 'cookie_secret2'];

app.use(bodyparser({enableTypes: ['json', 'form', 'text']}))
app.use(json())
app.use(logger())

// 跨域
app.use(cors({
    maxAge: 5,
    credentials: true, // 发送cookie
    origin: config.originHost,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
}))

app.use(good.routes(), good.allowedMethods())
app.use(user.routes(), user.allowedMethods())

app.on('error', (err, ctx) => {
  console.error('gliwu-server has error', err, ctx)
})

server.listen(3000)
