import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Auth from '@/views/auth/Auth'
import SignIn from '@/views/auth/SignIn'
import SignUp from '@/views/auth/SignUp'
import Verify from '@/views/auth/Verify'
import SignOut from '@/views/auth/SignOut'
import App from '@/views/app/App'
import Dashboards from '@/views/app/Dashboards'
import Integrations from '@/views/app/Integrations'
import Widgets from '@/views/app/Widgets'
import Settings from '@/views/app/Settings'

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
        },
        {
          path: 'signout',
          name: 'signout',
          component: SignOut
        }
      ]
    },
    {
      path: '/app',
      component: App,
      children: [
        {
          path: '',
          name: 'dashboards',
          component: Dashboards
        },
        {
          path: 'i',
          name: 'integrations',
          component: Integrations
        },
        {
          path: 'w',
          name: 'widgets',
          component: Widgets
        },
        {
          path: 's',
          name: 'settings',
          component: Settings
        }
      ]
    }
  ]
})
