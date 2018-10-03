import Vue from 'vue'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'
import attachCognitoModule from '@vuetify/vuex-cognito-module'
import config from '@/config'
import router from '@/router'

// Vuex modules
import App from '@/store/modules/App'
import Dashboard from '@/store/modules/Dashboard'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    App,
    Dashboard
  },
  // eslint-disable-next-line
  strict: process.env.NODE_ENV !== 'production'
})

// Attach Vue Router sync module to Vuex store
sync(store, router, { moduleName: 'Route' })

// Attach AWS Amplify Cognito module to Vuex store
attachCognitoModule(store, {
  userPoolId: config.cognito.USER_POOL_ID,
  identityPoolId: config.cognito.IDENTITY_POOL_ID,
  userPoolWebClientId: config.cognito.CLIENT_ID,
  region: config.cognito.REGION
}, 'Cognito')

export default store
