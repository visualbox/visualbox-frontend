import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import router from '@/router'

const isProd = process.env.NODE_ENV === ' production'

Vue.use(VueAnalytics, {
  id: process.env.VUE_APP_GA_ID,
  router,
  autoTracking: {
    exception: true
  },
  debug: {
    enabled: !isProd,
    sendHitTask: isProd
  }
})
