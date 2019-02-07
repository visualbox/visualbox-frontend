import Vue from 'vue'
import router from '@/router'
import store from '@/store'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/global.styl'

// Libraries
import '@/lib/amplify'
import '@/lib/vuetify'

// Services
import '@/service/RegisterServiceWorker'

import '@/components/editor/MonacoEditor'
import App from '@/App.vue'

Vue.config.productionTip = false
/*
Vue.config.errorHandler = function (err, vm, info) {
  // noop
}
*/

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
