import Vue from 'vue'
import Vuetify from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'
import '@/assets/styles/global.styl'

Vue.use(Vuetify, {
  theme: {
    primary: '#4CAF50',
    secondary: '#5163ba',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#ffc200'
  },
  iconfont: 'mdi'
})
