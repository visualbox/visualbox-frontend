<template lang="pug">
#dashboard-loading
  v-layout(align-center justify-center column)
    .display-2.font-weight-thin Opening <b>{{ label }}</b>
    .headline.font-weight-thin.mt-3 {{ statusMsg }}
  canvas.particles
</template>

<script>
import get from 'lodash-es/get'
import Particles from 'particlesjs'
import { mapState } from 'vuex'

export default {
  name: 'DashboardLoading',
  data: () => ({
    particles: null,
    statusMsg: 'STARTING UP...'
  }),
  computed: {
    ...mapState('Dashboard', ['loaded']),
    label () {
      return get(this.loaded, 'label', 'VisualBox')
    }
  },
  mounted () {
    this.particles = Particles.init({
      selector: '.particles',
      maxParticles: 100,
      color: '#444',
      sizeVariations: 4,
      speed: 0.2
    })
    setTimeout(() => this.statusMsg = 'PROVISIONING...', 5000)
    setTimeout(() => this.statusMsg = 'PENDING...', 15000)
    setTimeout(() => this.statusMsg = 'INITIALIZING...', 25000)
  },
  beforeDestroy () {
    this.particles.destroy()
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-loading
  position absolute
  top 0; left 0; right 0; bottom 0;
  background #000
  z-index 99

  canvas
    position absolute
    top 0; left 0; right 0; bottom 0;
    display block

  .layout
    height 100%
    z-index 100

    b
      font-weight 100
      color #4CAF50
</style>
