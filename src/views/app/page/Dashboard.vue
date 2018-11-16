<template lang="pug">
v-container#dashboard.pa-0(
  v-if="loaded !== null && typeof loaded !== 'undefined'"
  fluid
)
  app-context-toolbar
    v-btn(
      @click="DASHBOARD_SET_EDITING(!isEditing)"
      icon outline
    )
      v-icon {{ editingIcon }}
    v-btn(
      v-if="focusedWidget"
      @click="DASHBOARD_REMOVE_WIDGET"
      icon outline
    )
      v-icon mdi-delete
    v-spacer
    v-btn(
      @click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)"
      icon outline
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
    ...mapGetters('Dashboard', ['loaded', 'focusedWidget']),
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
      return this.isEditing ? 'mdi-lock' : 'mdi-cursor-move'
    },
    fullscreenIcon () {
      return this.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
    }
  },
  watch: {
    loaded: {
      handler: _.debounce(async function (newVal, oldVal) {
        // Don't display 'Saved changes' when changing dashboard
        if (newVal === null || oldVal === null || newVal.id !== oldVal.id)
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
    ...mapActions('Dashboard', ['load', 'closeLoaded', 'commitLoaded']),
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_EDITING',
      'DASHBOARD_SET_FULLSCREEN',
      'DASHBOARD_REMOVE_WIDGET'
    ])
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
