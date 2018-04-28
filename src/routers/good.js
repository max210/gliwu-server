import Router from 'koa-router'

import * as good from '../controllers/good'
import adminRequired from '../middlewares/adminRequired'

const router = new Router()

router.get('/api/good', good.getGoods)

// 管理员相关
router.get('/api/admin/get-all-goods', adminRequired, good.getGoods)
router.post('/api/admin/new-good', adminRequired, good.newGood)
router.post('/api/admin/update-good', adminRequired, good.updateGood)
router.post('/api/admin/delete-good', adminRequired, good.delateGood)

export default router
