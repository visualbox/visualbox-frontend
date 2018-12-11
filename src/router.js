import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Auth from '@/views/auth/Auth'
import SignIn from '@/views/auth/SignIn'
import SignUp from '@/views/auth/SignUp'
import Verify from '@/views/auth/Verify'
import Forgot from '@/views/auth/Forgot'
import App from '@/views/app/App'
import SignOut from '@/views/app/SignOut'

// Index
import DashboardsCtx from '@/views/app/index/DashboardsCtx'
import DashboardsIndex from '@/views/app/index/DashboardsIndex'
import IntegrationsCtx from '@/views/app/index/IntegrationsCtx'
import IntegrationsIndex from '@/views/app/index/IntegrationsIndex'
import WidgetsCtx from '@/views/app/index/WidgetsCtx'
import WidgetsIndex from '@/views/app/index/WidgetsIndex'

// Page
import DashboardCtx from '@/views/app/page/DashboardCtx'
import Dashboard from '@/views/app/page/Dashboard'
import WidgetCtx from '@/views/app/page/WidgetCtx'
import Widget from '@/views/app/page/Widget'
import IntegrationCtx from '@/views/app/page/IntegrationCtx'
import Integration from '@/views/app/page/Integration'

// Public
import WidgetPublic from '@/views/app/public/WidgetPublic'
import IntegrationPublic from '@/views/app/public/IntegrationPublic'

// Help
import HelpCtx from '@/views/app/help/HelpCtx'
import HelpIndex from '@/views/app/help/HelpIndex'

// Settings
import SettingsCtx from '@/views/app/settings/SettingsCtx'
import SettingsIndex from '@/views/app/settings/SettingsIndex'
import SettingsApp from '@/views/app/settings/SettingsApp'

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
          path: 'verify/:code?/:email?',
          name: 'verify',
          component: Verify
        },
        {
          path: 'forgot/:code?',
          name: 'forgot',
          component: Forgot
        }
      ]
    },
    {
      path: '/app',
      alias: '/app/d',
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
          path: 'signout',
          name: 'signout',
          component: SignOut
        },
        {
          path: 'd/:id',
          name: 'dashboard',
          components: {
            context: DashboardCtx,
            default: Dashboard
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
          path: 'i/:id',
          name: 'integration',
          components: {
            context: IntegrationCtx,
            default: Integration
          }
        },
        {
          path: 'i/:id/public',
          name: 'integration-public',
          components: {
            context: IntegrationsCtx,
            default: IntegrationPublic
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
          path: 'w/:id/public',
          name: 'widget-public',
          components: {
            context: WidgetsCtx,
            default: WidgetPublic
          }
        },
        {
          path: 'h/:page?',
          name: 'help-index',
          components: {
            context: HelpCtx,
            default: HelpIndex
          }
        },
        {
          path: 's/',
          name: 'settings-index',
          components: {
            context: SettingsCtx,
            default: SettingsIndex
          }
        },
        {
          path: 's/app',
          name: 'settings-app',
          components: {
            context: SettingsCtx,
            default: SettingsApp
          }
        }
      ]
    }
  ]
})
