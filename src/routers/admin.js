import Router from 'koa-router'

const router = Router()

router.get('/admin', async (ctx, next) => {
  ctx.body = 'this is admin page'
})

export default router
