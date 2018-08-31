<template lang="pug">
v-container(fluid)
  v-container#jumbotron(fluid fill-height)
    v-layout(align-center justify-center)
      v-flex(xs12 text-xs-center)
        #visualbox-animation.d-inline-block
        //- .display-3.font-weight-thin VISUALBOX
        .display-1.font-weight-light.mt-4 Data integration and visualization toolbox

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

  #jumbotron
    height 800px
    color #FFF !important
    background linear-gradient(160deg, #9fffe7, #1ee9b6 75%, #42eac1 75%, #05d6a1 100%)

    #visualbox-animation
      width 250px

  #infotron
    height 600px
    color #edeef1 !important
    background #253853
</style>
