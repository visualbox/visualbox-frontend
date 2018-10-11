import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Auth from '@/views/auth/Auth'
import SignIn from '@/views/auth/SignIn'
import SignUp from '@/views/auth/SignUp'
import Verify from '@/views/auth/Verify'
import SignOut from '@/views/auth/SignOut'
import App from '@/views/app/App'

// Index
import DashboardsCtx from '@/views/app/index/DashboardsCtx'
import DashboardsIndex from '@/views/app/index/DashboardsIndex'
import IntegrationsCtx from '@/views/app/index/IntegrationsCtx'
import IntegrationsIndex from '@/views/app/index/IntegrationsIndex'
import WidgetsCtx from '@/views/app/index/WidgetsCtx'
import WidgetsIndex from '@/views/app/index/WidgetsIndex'
import SettingsCtx from '@/views/app/index/SettingsCtx'
import SettingsIndex from '@/views/app/index/SettingsIndex'

// Page
import WidgetCtx from '@/views/app/page/WidgetCtx'
import Widget from '@/views/app/page/Widget'

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
          name: 'dashboards-index',
          components: {
            context: DashboardsCtx,
            default: DashboardsIndex
          }
        },
        {
          path: 'i',
          name: 'integrations-index',
          components: {
            context: IntegrationsCtx,
            default: IntegrationsIndex
          }
        },
        {
          path: 'w',
          name: 'widgets-index',
          components: {
            context: WidgetsCtx,
            default: WidgetsIndex
          }
        },
        {
          path: 'w/:id',
          name: 'widget',
          components: {
            context: WidgetCtx,
            default: Widget
          }
        },
        {
          path: 's',
          name: 'settings-index',
          components: {
            context: SettingsCtx,
            default: SettingsIndex
          }
        }
      ]
    }
  ]
})
