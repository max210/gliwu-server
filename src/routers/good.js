import Router from 'koa-router'

const router = Router()

router.get('/goods', async (ctx, next) => {
  ctx.body = 'this is goods page'
})

export default router
