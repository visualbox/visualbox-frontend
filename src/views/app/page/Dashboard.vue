<template lang="pug">
v-container#dashboard.pa-0(
  v-if="loaded !== null && typeof loaded !== 'undefined'"
  fluid
)
  app-context-toolbar(:class="{ 'fullscreen' : isFullscreen }")
    v-btn(
      @click="DASHBOARD_SET_EDITING(!isEditing)"
      icon
    )
      v-icon {{ editingIcon }}
    template(v-if="isFullscreen")
      v-spacer
      span VisualBox.io
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
    :class="{ 'fullscreen' : isFullscreen }"
  )
    dashboard-layout.elevation-5(:style="style")
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions } from 'vuex'
import { AppContextToolbar, DashboardLayout } from '@/components/app'

export default {
  name: 'Dashboard',
  components: {
    AppContextToolbar,
    DashboardLayout
  },
  computed: {
    ...mapState('Dashboard', ['loaded', 'isEditing', 'isFullscreen']),
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
      'DASHBOARD_SET_FULLSCREEN'
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

  .v-toolbar.fullscreen, .layout.fullscreen
    position fixed
    left 0
    right 0
    z-index 100

  .v-toolbar.fullscreen
    top 0
  .layout.fullscreen
    top 48px
    bottom 0
</style>
