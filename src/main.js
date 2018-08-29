import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import attachCognitoModule from '@vuetify/vuex-cognito-module'
import router from '@/router'
import store from '@/store'

// import '@/lib/amplify'
import '@/lib/vuetify'
import '@/mixins/global'

import '@/components/base'
import App from '@/App.vue'

// Attach Vue Router sync module to Vuex store
sync(store, router, { moduleName: 'Route' })

// Attach AWS Amplify Cognito module to Vuex store
attachCognitoModule(store, {
  userPoolId: process.env.VUE_APP_USER_POOL_ID,
  identityPoolId: process.env.VUE_APP_IDENTITY_POOL_ID,
  userPoolWebClientId: process.env.VUE_APP_CLIENT_ID,
  region: process.env.VUE_APP_REGION
}, 'Cognito')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
