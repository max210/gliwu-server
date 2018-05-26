import R from 'ramda'
import axios from 'axios'
import bcrypt from 'bcrypt'
import jwt from 'jwt-simple'
import mongoose from 'mongoose'
import isEmail from 'validator/lib/isEmail'

import config from '../config'
import sendEmail from './sendEmail'

const User = mongoose.model('User')

// 注册
export const signup = async (ctx, next) => {
  const name = (ctx.request.body.name).trim()
  const email = (ctx.request.body.email).trim()
  const pass = (ctx.request.body.pass).trim()
  const rePass = (ctx.request.body.rePass).trim()

  // 验证信息的正确性
  if (R.any(item => item === '')([name, email, pass, rePass])) {
    ctx.body = { status: 1, msg: '信息不完整' }
    return
  }
  if (name.length < 3) {
    ctx.body = { status: 1, msg: '用户名至少需要3个字符' }
    return
  }
  if (!isEmail(email)) {
    ctx.body = {status: 1, msg: '邮箱不合法'}
    return
  }
  if (pass !== rePass) {
    ctx.body = { status: 1, msg: '两次密码输入不一致' }
    return
  }

  //验证用户名是否已注册
  const hadName = await User.findOne({name})
  if (hadName || name === 'admin') {
    ctx.body = { status: 1, msg: '用户名已被注册' }
    return
  }

  //验证邮箱是否已注册
  const hadEmail = await User.findOne({email})
  if (hadEmail) {
    ctx.body = { status: 1, msg: '邮箱已被注册' }
    return
  }

  const token = jwt.encode(pass, config.jwtSecret)
  try {
    await sendEmail(name, email, token)
    ctx.body = { status: 0, msg: '请查看您的邮箱，点击激活链接以激活您的账号'}
  } catch (e) {
    ctx.body = { status: 1, msg: '邮件发送失败'}
  }

}

//激活用户账户
export const signupActive = async (ctx, next) => {
  const { name, email, token } = ctx.request.body
  const pass = jwt.decode(token, config.jwtSecret)

  const user = new User({ name, email, pass })
  try {
    await user.save()
    ctx.body = { status: 0, msg: '注册成功' }
  } catch (e) {
    ctx.body = { status: 1, msg: '注册失败，请稍后再试～' }
  }
}

// 登录
export const signin = async (ctx, next) => {
  const nameOrEmail = (ctx.query.nameOrEmail).trim()
  const pass = (ctx.query.pass).trim()

  // 验证信息的正确性
  if (R.any(item => item === '')([nameOrEmail, pass])) {
    ctx.body = { status: 1, msg: '信息不完整' }
    return
  }

  // 查找用户
  const user = await User.findOne({
    $or: [{name: nameOrEmail}, {email: nameOrEmail}]
  })
  if (!user) {
    ctx.body = { status: 1, msg: '无此用户' }
    return
  }

  // 验证密码
  const isOk = await user.comparePassword(pass, user.pass)
  if (!isOk) {
    ctx.body = { status: 1, msg: '密码错误' }
    return
  }

  const payload = {
    _id: user._id,
    name: user.name
  }
  // 生成token
  const token = jwt.encode(payload, config.jwtSecret)

  const opts = {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    signed: true,
    httpOnly: true
  }

   ctx.cookies.set(config.cookieName, token, opts)
   ctx.body = { status: 0, msg: '登录成功', name: user.name, token }   //返回token 以备客户端需要
}

//第三方登录（GitHub）
export const thirdLogin = async (ctx, next) => {
  const code = ctx.request.body.code
  try {
    const params = {
      client_id: '3e06889acba3ac350514',
      client_secret: 'edfd77e8ffe89cb7afd7a4dbe748fa024bdb7a44',
      code
    }
    const res = await axios.post(`https://github.com/login/oauth/access_token`, params) // 获取access_token
    const access_token = R.pipe(R.split('&'), R.head, R.split('='), R.last)(res.data)
    const resData = await axios.get(`https://api.github.com/user`, {params: { access_token }}) // 获取GitHub用户信息

    const name = resData.data.login
    const email = resData.data.email
    const githubId = resData.data.id

    const github = await User.findOne({ githubId }).exec()

    // 第一次github登录
    if (!github) {
      const user = new User({ name, email, githubId })
      await user.save()
    }

    // 获取_id，返回cookie
    const findUser = await User.findOne({ name }).exec()

    const payload = {
      _id: findUser._id,
      name: findUser.name
    }
    // 生成token
    const token = jwt.encode(payload, config.jwtSecret)

    const opts = {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      signed: true,
      httpOnly: true
    }

     ctx.cookies.set(config.cookieName, token, opts)
     ctx.body = { status: 0, msg: '登录成功', name: findUser.name, token }   //返回token 以备客户端需要
  } catch (e) {
    ctx.body = { status: 1, msg: '登录失败'}
  }
}

// 登出
export const signout = async (ctx, next) => {
   ctx.cookies.set(config.cookieName, '', { signed: false, maxAge: 0 })
   ctx.body = { status: 0, msg: '已登出' }
}

// 检查登录状态
export const checklogin = async (ctx, next) => {
  const token = ctx.cookies.get(config.cookieName) || ''
  if (token) {
    const decoded = jwt.decode(token, config.jwtSecret)
    if (decoded) {
      ctx.body = { status: 0, msg: '已登录', name: decoded.name }
    }
  } else {
    ctx.body = { status: 1, msg: '未登录' }
  }
}

// 添加收藏
export const addCollection = async (ctx, next) => {
  const { productId, productImg, productLink } = ctx.request.body
  const _id = ctx.user._id
  const product = { productId, productImg, productLink }

  try {
    const user = await User.findOne({_id}).exec()
    const filterResult = R.filter(R.propEq('productId', productId), user.likes)

    if (filterResult.length) {
       ctx.body = {status: 1, msg: '您已经收藏过了，快去「我的收藏」看看'}
       return
    }

    user.likes.push(product)
    await user.save()
    ctx.body = {status: 0, msg: '收藏成功，快去「我的收藏」看看'}

  } catch (e) {
    ctx.body = {status: 1, msg: '系统繁忙，稍后再试'}
  }

}

// 取消收藏
export const removeCollection = async (ctx, next) => {
  const productId = ctx.query.productId
  const _id = ctx.user._id

  try {
    const user = await User.findOne({_id}).exec()
    let newlikes = R.reject(R.propEq('productId', productId), user.likes)

    user.likes = newlikes
    await user.save()
    ctx.body = {status: 0, msg: '取消收藏成功'}

  } catch (e) {
    ctx.body = {status: 1, msg: '系统繁忙，稍后再试'}
  }
}

// 收藏的商品
export const collection = async (ctx, next) => {
  const _id = ctx.user._id

  try {
    const user = await User.findOne({ _id })
    ctx.body = { status: 0, msg: '获取成功', data: user.likes }
  } catch (e) {
    ctx.body = { status: 1, msg: '获取失败' }
  }
}
