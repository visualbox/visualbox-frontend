import Vue from 'vue'
import router from '@/router'
import store from '@/store'

import '@/lib/amplify'
import '@/lib/vuetify'
import '@/mixins/global'
import '@/components/base'

import App from '@/App.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
