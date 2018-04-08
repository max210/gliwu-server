import Router from 'koa-router'

import * as user from '../middlewares/user'

const router = new Router({prefix: '/api/user'})

router.post('/signup', user.signup)
router.get('/signin', user.signin)
router.get('/signout')

export default router
