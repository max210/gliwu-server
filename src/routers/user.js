import Router from 'koa-router'

import * as user from '../middlewares/user'

const router = new Router({prefix: '/api/user'})

router.post('/signup', user.signup)
router.get('/signin', user.signin)
router.get('/signout', user.signout)

export default router
