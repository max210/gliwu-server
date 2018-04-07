import Router from 'koa-router'

import * as sign from '../middlewares/sign'

const router = new Router({prefix: '/api/user'})

router.post('/signup', sign.signup)
router.get('/signin', sign.signin)
router.get('/signout')

export default router
