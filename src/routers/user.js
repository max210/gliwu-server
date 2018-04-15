import Router from 'koa-router'

import * as user from '../middlewares/user'
import authRequired from '../middlewares/authRequired'

const router = new Router({prefix: '/api/user'})

router.post('/signup', user.signup)
router.get('/signin', user.signin)
router.get('/signout', user.signout)
router.get('/checklogin', user.checklogin)

router.get('/collection', authRequired, user.addCollection)
router.get('/removeCollection', authRequired, user.removeCollection)

export default router
