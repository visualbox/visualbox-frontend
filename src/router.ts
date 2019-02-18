import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Auth from '@/views/auth/Auth.vue'
import SignIn from '@/views/auth/SignIn.vue'
import SignUp from '@/views/auth/SignUp.vue'
import Verify from '@/views/auth/Verify.vue'
import Forgot from '@/views/auth/Forgot.vue'
import App from '@/views/app/App.vue'
import SignOut from '@/views/app/SignOut.vue'

// Index
import DashboardsCtx from '@/views/app/index/DashboardsCtx.vue'
import DashboardsIndex from '@/views/app/index/DashboardsIndex.vue'
import IntegrationsCtx from '@/views/app/index/IntegrationsCtx.vue'
import IntegrationsIndex from '@/views/app/index/IntegrationsIndex.vue'
import WidgetsCtx from '@/views/app/index/WidgetsCtx.vue'
import WidgetsIndex from '@/views/app/index/WidgetsIndex.vue'

// Page
import DashboardCtx from '@/views/app/page/DashboardCtx.vue'
import Dashboard from '@/views/app/page/Dashboard.vue'
import WidgetCtx from '@/views/app/page/WidgetCtx.vue'
import Widget from '@/views/app/page/Widget.vue'
import IntegrationCtx from '@/views/app/page/IntegrationCtx.vue'
import Integration from '@/views/app/page/Integration.vue'

// Help
import HelpCtx from '@/views/app/help/HelpCtx.vue'
import HelpIndex from '@/views/app/help/HelpIndex.vue'

// Settings
import SettingsCtx from '@/views/app/settings/SettingsCtx.vue'
import SettingsIndex from '@/views/app/settings/SettingsIndex.vue'
import SettingsApp from '@/views/app/settings/SettingsApp.vue'

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
