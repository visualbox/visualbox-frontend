<template lang="pug">
v-container(fluid)
  v-responsive#jumbotron(:aspect-ratio="16/9")
    v-container(fluid fill-height)
      v-layout(align-center justify-center)
        v-flex(xs12 text-xs-center)
          //- .display-4.font-weight-thin VISUALBOX
          svg#my-svg(
            width="580"
            height="120"
          )
            g
              text(
                stroke="#000"
                font-family="Roboto"
                font-weight="100"
                font-size="114"
                y="100"
                x="0"
                stroke-width="0"
                fill="#ff0067"
              ) VISUALBOX
          .display-1.font-weight-light.mt-4 Quck data integration and visualization tool
</template>

<script>
import Vivus from 'vivus'

export default {
  name: 'Home',
  mounted () {
    let v = new Vivus('my-svg', { duration: 500 })
  }
}
</script>

<style lang="stylus" scoped>
.container
  padding 0

  #jumbotron
    background-color #252525
    color #ff0067 !important
</style>
