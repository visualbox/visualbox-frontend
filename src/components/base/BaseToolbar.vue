<template lang="pug">
v-container.base-toolbar(v-if="showToolbar")
  v-toolbar(
    color="transparent"
    flat
  )
    img(
      @click="$router.push('/')"
      :src="require('../../assets/img/vbox-white.svg')"
    )
    v-toolbar-title(@click="$router.push('/')") VISUALBOX
    v-spacer
    v-toolbar-items
      v-btn(
        href="https://docs.visualbox.io"
        target="_new"
        text exact
      ) Docs
      v-btn(
        to="/auth"
        text exact
      ) Sign In
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'BaseToolbar',
  computed: {
    ...mapGetters('Cognito', ['isLoggedIn']),
    ...mapState('Cognito', ['user']),
    ...mapState('Route', ['path']),
    showToolbar () {
      return this.path.substr(0, 4) !== '/app'
    }
  },
  methods: mapActions('Cognito', ['signOut'])
}
</script>

<style lang="stylus" scoped>
.base-toolbar
  padding 0
  max-height 64px
  z-index 10

  img
    width 40px
    cursor pointer

  .v-toolbar__title
    padding-left 15px
    font-weight 300
    cursor pointer

  >>> .v-toolbar__content
    padding 0 0 0 16px !important
</style>
