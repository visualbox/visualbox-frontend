<template lang="pug">
v-container#dashboard.pa-0(
  v-if="loaded !== null && typeof loaded !== 'undefined'"
  fluid
)
  app-context-toolbar
    v-btn(
      @click="DASHBOARD_SET_EDITING(!isEditing)"
      icon
    )
      v-icon {{ editingIcon }}
    v-spacer
    v-btn(
      @click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)"
      icon
    )
      v-icon {{ fullscreenIcon }}
  v-layout(
    align-center
    justify-center
    row fill-height
  )
    dashboard-layout.elevation-5(:style="style")
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, DashboardLayout } from '@/components/app'

export default {
  name: 'Dashboard',
  components: {
    AppContextToolbar,
    DashboardLayout
  },
  computed: {
    ...mapState('Dashboard', ['isEditing', 'isFullscreen']),
    ...mapGetters('Dashboard', ['loaded']),
    style () {
      const { width, height } = this.loaded.settings
      const { r, g, b, a } = this.loaded.settings.rgba
      const bgc = `rgba(${r}, ${g}, ${b}, ${a})`

      return {
        'background-color': bgc,
        'width': width,
        'height': height
      }
    },
    editingIcon () {
      return this.isEditing ? 'mdi-pencil-off' : 'mdi-pencil'
    },
    fullscreenIcon () {
      return this.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
    }
  },
  watch: {
    loaded: {
      handler: _.debounce(async function (oldVal, newVal) {
        // Don't display 'Saved changes' when changing dashboard
        if (oldVal === null || newVal === null || oldVal.id !== newVal.id)
          return

        try {
          await this.commitLoaded()
          this.setSnackbar({
            type: '',
            msg: `Saved changes`,
            timeout: 1500
          })
        } catch (e) {}
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Dashboard', ['DASHBOARD_SET_EDITING', 'DASHBOARD_SET_FULLSCREEN']),
    ...mapActions('Dashboard', ['load', 'closeLoaded', 'commitLoaded'])
  },
  mounted () {
    this.load(this.$route.params.id)
  },
  beforeDestroy () {
    this.closeLoaded()
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  height 100%
</style>
