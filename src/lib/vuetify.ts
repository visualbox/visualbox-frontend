import Vue from 'vue'
// @ts-ignore https://github.com/vuetifyjs/vue-cli-plugin-vuetify/issues/43
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'mdi',
  theme: {
    primary: '#4CAF50',
    secondary: '#5163ba',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#ffc200'
  }
})
