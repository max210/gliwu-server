import Router from 'koa-router'

import * as good from '../middlewares/good'

const router = new Router({prefix: '/api/good'})

router.get('/', good.getGoods)

export default router
