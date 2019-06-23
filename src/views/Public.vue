<template lang="pug">
v-container#public(fluid fill-height)
  v-layout(
    :align-center="!isReady"
    :column="!isReady"
    :row="isReady"
    justify-center
    fill-height
  )
    //- Loading
    template(v-if="!isReady")
      img(
        :src="require('../assets/img/vbox-white.svg')"
        width="150"
      )
      .headline.font-weight-light.mt-3 VisualBox

    //- Dashboard
    public-dashboard-layout(
      v-if="isReady"
      :style="style"
    )
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { PublicDashboardLayout } from '@/components/dashboard'

export default {
  name: 'Public',
  components: { PublicDashboardLayout },
  computed: {
    ...mapState('Public', ['loaded']),
    isReady () {
      return this.loaded !== null
    },
    style () {
      try {
        const { r, g, b, a } = this.loaded.settings.rgba
        const bgc = `rgba(${r}, ${g}, ${b}, ${a})`
        return {
          'background-color': bgc,
          'background-position': 'fixed'
        }
      } catch (e) {
        return {}
      }
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Public', ['initPublicDashboard']),
  },
  async mounted () {
    try {
      await this.initPublicDashboard(this.$route.params.id)
    } catch (e) {
      this.setSnackbar({
        type: 'error',
        msg: e.message
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
#public
  padding 0
</style>
