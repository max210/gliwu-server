import jwt from 'jwt-simple'

import config from '../config'

export default (ctx, next) => {
  const token = ctx.cookies.get(config.cookieName) || ''
  if (token) {
    const decoded = jwt.decode(token, config.jwtSecret)

    if (decoded) {
      ctx.user = decoded
      return next()
    }
    ctx.body = {status: 1, msg: '未登录'}
  }

  ctx.body = {status: 1, msg: '未登录'}
}
