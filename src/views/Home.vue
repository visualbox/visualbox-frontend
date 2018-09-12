<template lang="pug">
v-container(fluid)

  v-responsive.white--text(:aspect-ratio="2.5/1")
    v-container(fill-height grid-list-xl)
      v-layout(align-center justify-center wrap)
        #visualbox-animation.mx-4
        v-flex(shrink)
          .display-3.font-weight-light Data integration and
          .display-3.font-weight-light.mb-4 visualization toolbox
          div
            v-btn.primary--text(
              to="/auth/signup"
              color="white"
              large
            ) Get Started
            v-btn(
              color="white"
              large outline
            )
              v-icon(dark left) mdi-star-circle-outline
              | Features
            v-btn(
              to="/auth"
              color="white"
              large outline
            )
              v-icon(dark left) mdi-launch
              | Sign In

  v-container#infotron(fluid fill-height)
    v-layout(align-center justify-center)
      v-flex(xs12 text-xs-center)
        .display-3.font-weight-thin A CAPSTONE PROJECT
        .display-1.font-weight-light.mt-4 By Pontus Edvard Aurdal at the University of Tromsø
</template>

<script>
import Vivus from 'vivus'

export default {
  name: 'Home',
  data: () => ({
    vivus: null
  }),
  mounted () {
    this.vivus = new Vivus('visualbox-animation', {
      type: 'sync',
      duration: 100,
      animTimingFunction: Vivus.EASE,
      file: require('../assets/img/visualbox.svg')
    })
  }
}
</script>

<style lang="stylus" scoped>
.container
  padding 0

  .v-responsive
    padding 64px 16px
    background linear-gradient(160deg, #9fffe7, #1ee9b6 75%, #42eac1 75%, #05d6a1 100%)

    #visualbox-animation
      width 250px

  #infotron
    height 600px
    color #edeef1 !important
    background #253853
</style>
