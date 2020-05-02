<template lang="pug">
v-container#dashboard(
  v-if="loaded"
  :class="{ 'is-exploring': isExploring }"
  fluid
)
  v-toolbar.fs-toolbar(
    v-if="isFullscreen"
    dense flat
  )
    v-spacer
    v-btn(
      @click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)"
      text
    ) VisualBox.io
    v-spacer

  v-layout(
    justify-center
    row fill-height
    :nudge-fs="isFullscreen"
  )
    explorer(
      v-if="isExploring"
      :config="explorer"
    )
    dashboard-layout(:style="style")
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Explorer } from '@/components'
import { DashboardLayout } from '@/components/dashboard'

export default {
  name: 'Dashboard',
  components: {
    Explorer,
    DashboardLayout
  },
  computed: {
    ...mapState('Dashboard', [
      'loaded',
      'explorer',
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
@import '../../../styles/colors';

#dashboard
  height 100%
  padding 0

  &.is-exploring
    height 100% !important
    overflow hidden !important

  .fs-toolbar
    position fixed !important
    top 0; left 0; right 0;
    background-color $vb-app-ctx-toolbar !important
    z-index 1
  
  .nudge-fs
    padding-top 48px

  >>> #explorer
    position absolute !important
    padding 24px
    z-index 1
    background $vb-application
</style>
