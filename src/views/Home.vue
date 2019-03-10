<template lang="pug">
v-container
  .aurora-borealis
  v-responsive(:aspect-ratio="2.5/1")
    v-container(fill-height grid-list-xl)
      v-layout(align-center justify-center row wrap)
        v-flex(xs12 sm12 md8 lg8 xl6)
          .display-3.font-weight-thin Data integration and
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
              round outline
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
    background-image url(../assets/img/aurora-borealis.jpg)
    background-size cover

  .v-responsive
    padding 64px 16px
    color #FFF

    .v-card
      padding 40px 10px
      width 100%
      text-align center
      color #FFF
      background-color rgba(255, 255, 255, .25)
      border-radius 10px

      img
        width 100px
</style>
