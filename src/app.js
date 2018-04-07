import Koa from 'koa'
import json from 'koa-json'
import logger from 'koa-logger'
import onerror from 'koa-onerror'
import bodyparser from 'koa-bodyparser'

import { mongooseInit } from './models/init'
import good from './routers/good'
import user from './routers/user'

const app = new Koa()

//mongoose初始化
;(async () => {
  await mongooseInit()
})()

onerror(app)

app.use(bodyparser({enableTypes: ['json', 'form', 'text']}))
app.use(json())
app.use(logger())

app.use(good.routes(), good.allowedMethods())
app.use(user.routes(), user.allowedMethods())

app.on('error', (err, ctx) => {
  console.error('koa-server has error', err, ctx)
})

app.listen(3000)
