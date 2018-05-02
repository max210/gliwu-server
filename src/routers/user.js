import Router from 'koa-router'

import * as user from '../controllers/user'
import authRequired from '../middlewares/authRequired'

const router = new Router({prefix: '/api/user'})

router.post('/signup', user.signup)
router.post('/active', user.signupActive)
router.get('/signin', user.signin)
router.get('/signout', user.signout)
router.get('/checklogin', user.checklogin)

router.post('/add-collection', authRequired, user.addCollection)
router.get('/remove-collection', authRequired, user.removeCollection)
router.get('/collection', authRequired, user.collection)

export default router
