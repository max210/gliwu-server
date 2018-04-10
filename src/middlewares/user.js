import R from 'ramda'
import bcrypt from 'bcrypt'
import jwt from 'jwt-simple'
import validator from 'validator'

import config from '../config'
import userModel from '../models/user'

// 注册
export const signup = async (ctx, next) => {
  const name = validator.trim(ctx.query.name)
  const email = validator.trim(ctx.query.email)
  const pass = validator.trim(ctx.query.pass)
  const repass = validator.trim(ctx.query.repass)

  // 验证信息的正确性
  if (R.any(item => item === '')([name, email, pass, repass])) {
    ctx.body = {status: 1, msg: '信息不完整'}
    return
  }
  if (name.length < 3) {
    ctx.body = {status: 1, msg: '用户名至少需要3个字符'}
    return
  }
  // if (!validator.isEmail(email)) {
  //   ctx.body = {status: 1, msg: '邮箱不合法'}
  //   return
  // }
  if (pass !== repass) {
    ctx.body = {status: 1, msg: '两次密码输入不一致'}
    return
  }

  //验证用户名是否已注册
  const hadName = await User.findOne({name})
  if (hadName || name === 'admin') {
    ctx.body = {status: 1, msg: '用户名已被注册'}
    return
  }

  //验证邮箱是否已注册
  const hadEmail = await User.findOne({email})
  if (hadEmail) {
    ctx.body = {status: 1, msg: '邮箱已被注册'}
    return
  }

  let user = new userModel()
  user.name = name
  user.email = email
  user.pass = bcrypt.hashSync(pass, 10)
  try {
    await user.save()
    ctx.body = {status: 0, msg: '注册成功'}
  } catch (e) {
    ctx.body = {status: 1,msg: '注册失败，请稍后再试～'}
  }

  next()
}

// 登录
export const signin = async (ctx, next) => {
  const nameOrEmail = validator.trim(ctx.query.nameOrEmail)
  const pass = validator.trim(ctx.query.pass)

  // 验证信息的正确性
  if (R.any(item => item === '')([nameOrEmail, pass])) {
    ctx.body = {status: 1, msg: '信息不完整'}
    return
  }

  // 查找用户
  const user = await userModel.findOne({
    $or: [{name: nameOrEmail}, {email: nameOrEmail}]
  })
  if (!user) {
    ctx.body = {status: 1, msg: '无此用户'}
    return
  }

  // 验证密码
  const isOk = bcrypt.compareSync(pass, user.pass)
  if (!isOk) {
    ctx.body = {status: 1, msg: '密码错误'}
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
   //返回token 以备客户端需要
   ctx.body = {status: 0, msg: '登录成功', token}

}

// 登出
export const signout = async (ctx, next) => {
   ctx.cookies.set(config.cookieName, '', {signed:false,maxAge:0})
   ctx.body = {status: 0, msg: '已登出'}
}
