import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Auth from '@/views/Auth'
import SignIn from '@/views/auth/SignIn'
import SignUp from '@/views/auth/SignUp'
import Verify from '@/views/auth/Verify'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/auth',
      component: Auth,
      children: [
        {
          path: '',
          name: 'signin',
          component: SignIn
        },
        {
          path: 'signup',
          name: 'signup',
          component: SignUp
        },
        {
          path: 'verify',
          name: 'verify',
          component: Verify
        }
      ]
    }
  ]
})
