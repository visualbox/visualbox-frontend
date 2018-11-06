<template lang="pug">
v-container#dashboard(
  fluid
  v-if="loaded !== null && typeof loaded !== 'undefined'"
)
  v-layout(
    align-center
    justify-center
    row
    fill-height
  )
    dashboard-layout.elevation-5(
      :style="style"
    )
</template>

<script>
import * as _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import { DashboardLayout } from '@/components/app'

export default {
  name: 'Dashboard',
  components: { DashboardLayout },
  computed: {
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
            type: 'info',
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
