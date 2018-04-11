import jwt from 'jwt-simple'

import config from '../config'

export default (ctx, next) => {
  const token = ctx.cookies.get(config.cookieName) || ''
  const decoded = jwt.decode(token, config.jwtSecret)

  if (decoded) {
    ctx.user = decoded
    return next()
  }

  ctx.body = {status: 1, msg: '未登录'}
}
