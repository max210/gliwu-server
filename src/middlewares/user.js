import R from 'ramda'
import bcrypt from 'bcrypt'
import jwt from 'jwt-simple'
import isEmail from 'validator/lib/isEmail'

import config from '../config'
import User from '../models/user'

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
  // if (!isEmail(email)) {
  //   ctx.body = {status: 1, msg: '邮箱不合法'}
  //   return
  // }
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

  const user = new User({
    name,
    email,
    pass: bcrypt.hashSync(pass, 10)
  })

  try {
    await user.save()
    ctx.body = { status: 0, msg: '注册成功' }
  } catch (e) {
    ctx.body = { status: 1,msg: '注册失败，请稍后再试～' }
  }

  next()
}

// 登录
export const signin = async (ctx, next) => {
  console.log(typeof ctx.query.nameOrEmail)
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
  const isOk = bcrypt.compareSync(pass, user.pass)
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
  console.log(ctx.request.body)
  const { productId, productImg, productLink } = ctx.request.body
  const _id = ctx.user._id
  const product = { productId, productImg, productLink }

  try {
    const user = await User.findOne({_id}).exec()
    console.log(user)
    const filterResult = R.filter(R.propEq('productId', productId), user.likes)

    console.log(filterResult)
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
  console.log(productId)

  try {
    const user = await User.findOne({_id}).exec()
    console.log('user')
    console.log(user)
    let newlikes = R.reject(R.propEq('productId', productId), user.likes)

    console.log('newlikes')
    console.log(newlikes)
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
