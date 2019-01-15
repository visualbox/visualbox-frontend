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
            ) Get Started
            v-btn(
              color="white"
              outline
            )
              v-icon(dark left) mdi-star-circle-outline
              | Features
            v-btn(
              to="/auth"
              color="white"
              outline
            )
              v-icon(dark left) mdi-launch
              | Sign In

  v-container#infotron(fluid fill-height)
    v-layout(align-center justify-center)
      v-flex(xs12 text-xs-center)
        .display-3.font-weight-thin A CAPSTONE PROJECT
        .display-1.font-weight-light.mt-4 by Pontus Edvard Aurdal at the University of Tromsø – the Arctic University of Norway

  v-container#examples(fluid fill-height)
    v-layout(align-center justify-center)
      v-flex(xs12 text-xs-center)
        .display-3.font-weight-thin MONITOR AIR QUALITY AND BUS TRAFFIC
        img.mt-4(src="/dashboard_00.jpg")
      v-flex(xs12 text-xs-center)
        .display-3.font-weight-thin BECOME AN ATC OPERATOR
        img.mt-4(src="/dashboard_01.jpg")
      v-flex(xs12 text-xs-center)
        .display-3.font-weight-thin KEEP YOUR COOLERS IN CHECK
        img.mt-4(src="/dashboard_02.jpg")
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
      animTimingFunction: Vivus.EASE_IN,
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
    background linear-gradient(160deg, #b1f3b3, #68bd6a 75%, #73c777 75%, #235a25 100%)

    #visualbox-animation
      width 250px

  #infotron
    height 600px
    color #edeef1 !important
    background #333

  #examples
    padding-bottom 100px
    color #edeef1 !important
    background #333

    img
      max-width 100%
</style>
