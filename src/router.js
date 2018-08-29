import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Auth from '@/views/Auth'
import SignIn from '@/components/auth/SignIn'

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
        }
      ]
    }
  ]
})
