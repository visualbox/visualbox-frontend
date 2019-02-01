<template lang="pug">
v-container#dashboard(
  v-if="loaded"
  fluid
)
  v-layout(
    justify-center
    row fill-height
  )
    dashboard-layout(:style="style")
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapActions } from 'vuex'
import { ContextToolbar } from '@/components'
import { DashboardLayout } from '@/components/dashboard'

export default {
  name: 'Dashboard',
  components: {
    ContextToolbar,
    DashboardLayout
  },
  computed: {
    ...mapState('Dashboard', ['loaded']),
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
    loaded: {
      handler: debounce(async function (newVal, oldVal) {
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
  padding 0
</style>
