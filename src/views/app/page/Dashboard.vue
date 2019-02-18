<template lang="pug">
v-container#dashboard(
  v-if="loaded"
  fluid
)
  context-toolbar(v-if="isFullscreen")
    v-spacer
    v-btn(
      @click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)"
      flat
    ) VisualBox.io
    v-spacer

  v-layout(
    justify-center
    row
    :fill-height="!isLoading"
  )
    dashboard-loading(v-if="isLoading")
    explorer(
      v-if="isExploring"
      :config="explorer"
    )
    dashboard-layout(
      v-if="!isExploring"
      :style="style"
    )
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions } from 'vuex'
import { ContextToolbar, Explorer } from '@/components'
import { DashboardLoading, DashboardLayout } from '@/components/dashboard'

export default {
  name: 'Dashboard',
  components: {
    ContextToolbar,
    Explorer,
    DashboardLoading,
    DashboardLayout
  },
  computed: {
    ...mapState('Dashboard', [
      'loaded',
      'explorer',
      'isLoading',
      'isFullscreen',
      'isExploring'
    ]),
    style () {
      const { r, g, b, a } = this.loaded.settings.rgba
      const bgc = `rgba(${r}, ${g}, ${b}, ${a})`
      return {
        'background-color': bgc,
        'background-position': 'fixed'
      }
    }
  },
  watch: {
    /**
     * Watch if loaded dashboard changes (in any way)
     * and debounce a commit so that progress is not lost.
     */
    loaded: {
      handler: debounce(async function (newVal, oldVal) {
        // Don't display 'Saved changes' when changing dashboard
        if (newVal === null || oldVal === null || newVal.id !== oldVal.id)
          return

        // Debounce may fire after dashboard has left
        if (!this.loaded)
          return

        try {
          await this.commit()
          this.setSnackbar({
            type: 'info',
            msg: `Saved changes`,
            timeout: 1000
          })
        } catch (e) {
          this.setSnackbar({
            type: 'error',
            msg: e.message
          })
        }
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Dashboard', ['load', 'commit']),
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FULLSCREEN'])
  },
  async mounted () {
    this.load(this.$route.params.id)
  },
  beforeDestroy () {
    this.commit(true)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  height 100%
  padding 0
</style>
