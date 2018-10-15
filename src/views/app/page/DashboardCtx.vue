<template lang="pug">
#dashboard-ctx(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-tabs(
    color="rgba(0,0,0,0)"
    slider-color="primary"
    grow
  )
    v-tab
      v-icon device_hub
    v-tab
      v-icon widgets
    v-tab
      v-icon settings
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'DashboardCtx',
  components: { AppContextToolbar },
  computed: {
    ...mapGetters('Dashboard', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set: _.debounce(function (label) {
        console.log('set')
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    updatedAt () {
      const { updatedAt } = this.loaded
      return moment(updatedAt).format('DD/MM HH:mm:ss')
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
