import Vue from 'vue'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'
import router from '@/router'
import { API, DashboardHandler, IFrameHandler } from '@/service'

// Vuex modules
import App from '@/store/modules/App'
import Cognito from '@/store/modules/Cognito'
import Dashboard from '@/store/modules/Dashboard'
import Widget from '@/store/modules/Widget'
import Integration from '@/store/modules/Integration'
import Project from '@/store/modules/Project'
import Public from '@/store/modules/Public'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    App,
    Cognito,
    Dashboard,
    Widget,
    Integration,
    Project,
    Public
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})

// Attach Vue Router sync module to Vuex store
sync(store, router, { moduleName: 'Route' })

// Attach store instance so services can use it
API.attachStore(store)
DashboardHandler.attachStore(store)
IFrameHandler.attachStore(store)

export default store
