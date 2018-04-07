import User from '../models/user'

const signup = async (ctx, next) => {
  const { name, email, pass } = ctx.query
  const hadName = await User.findOne({ name })

  //验证用户名是否已注册
  if (hadName || name === 'admin') {
    ctx.body = {
      status: 1,
      msg: '用户名已被注册'
    }
    return
  }

  //验证邮箱是否已注册
  const hadEmail = await User.findOne({ email })
  if (hadEmail) {
    ctx.body = {
      status: 1,
      msg: '邮箱已被注册'
    }
    return
  }

  let user = new User()
  user.name = name
  user.email = email
  user.pass = pass
  try {
    await user.save()
    ctx.body = {
      status: 0,
      msg: '注册成功'
    }
  } catch (e) {
    ctx.body = {
      status: 1,
      msg: '注册失败，请稍后再试～'
    }
  }

  next()
}

export default signup
