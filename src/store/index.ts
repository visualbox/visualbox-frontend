import Vue from 'vue'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'
import router from '@/router'
import API from '@/service/API'

// Vuex modules
import App from '@/store/modules/App'
import Cognito from '@/store/modules/Cognito'
import Dashboard from '@/store/modules/Dashboard'
import Widget from '@/store/modules/Widget'
import Integration from '@/store/modules/Integration'
import Project from '@/store/modules/Project'
import Data from '@/store/modules/Data'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    App,
    Cognito,
    Dashboard,
    Widget,
    Integration,
    Project,
    Data
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})

// Attach Vue Router sync module to Vuex store
sync(store, router, { moduleName: 'Route' })

// Attach store instance so API can make use of it
API.attachStore(store)

export default store
