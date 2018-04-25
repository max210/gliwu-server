import Router from 'koa-router'

import * as good from '../middlewares/good'
import adminRequired from '../middlewares/adminRequired'

const router = new Router()

router.get('/api/good', good.getGoods)

// 管理员相关
router.get('/api/admin/get-all-goods', adminRequired, good.getGoods)

export default router
