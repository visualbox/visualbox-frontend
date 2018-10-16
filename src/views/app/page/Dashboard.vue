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
    #slate.elevation-5(:style="style")
      span foo
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
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
  methods: mapActions('Dashboard', ['load']),
  mounted () {
    this.load(this.$route.params.id)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  height 100%

  #slate
    height 100%
    background #FFF
</style>
