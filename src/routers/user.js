import Router from 'koa-router'

import signup from '../middlewares/signup'

const router = new Router({prefix: '/api/user'})

router.post('/signup', signup)
router.get('/signin')
router.get('/signout')

export default router
