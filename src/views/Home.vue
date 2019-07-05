<template lang="pug">
v-container
  .aurora-borealis
    video(
      autoplay
      loop
      muted
      :poster="require('../assets/img/hero.jpg')"
    )
      source(
        :src="require('../assets/img/hero.webm')"
        type="video/webm"
      )
      source(
        :src="require('../assets/img/hero.mp4')"
        type="video/mp4"
      )
  v-responsive(:aspect-ratio="2.5/1")
    v-container(fill-height grid-list-xl)
      v-layout(align-center justify-center row wrap)
        v-flex(xs12 sm12 md8 lg8 xl6)
          .display-3.font-weight-thin.mb-2 Data integration and
          .display-3.font-weight-thin.mb-4 visualization toolbox
          .headline.font-weight-thin
            | Integrate any data source and create beautiful
            | realtime dashboards.
        .hidden-md-and-up.my-4 &nbsp;
        v-flex(xs12 sm12 md4 lg3 xl2)
          v-card
            img(:src="require('../assets/img/vbox-white.svg')")
            .subheading.font-weight-light.my-4
              | Technology preview
            v-btn(
              to="/auth/signup"
              color="white"
              rounded outlined
            ) Try Now
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Home'
})
</script>

<style lang="stylus" scoped>
.container
  padding 0

  .aurora-borealis
    height 100%
    position absolute
    top 0; left 0; right 0;
    overflow hidden
    // background-image url(../assets/img/aurora-borealis.jpg)
    // background-size cover

    video
      width 100%
      height 100%
      -o-object-fit cover
      object-fit cover

  .v-responsive
    padding 64px 16px
    color #FFF

    .v-card
      padding 40px 10px
      width 100%
      color #FFF
      text-align center
      background-color rgba(255, 255, 255, .25)
      border-radius 10px

      img
        width 100px
</style>
