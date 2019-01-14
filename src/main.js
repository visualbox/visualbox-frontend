import Vue from 'vue'
import router from '@/router'
import store from '@/store'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/global.styl'

import '@/lib/amplify'
import '@/lib/vuetify'
import '@/mixins/global'
import '@/components/base'

import App from '@/App.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
