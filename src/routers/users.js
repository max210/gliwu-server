import Router from 'koa-router'

const router = Router()

router.get('/users', async (ctx, next) => {
  ctx.body = 'this is user page'
})

export default router
