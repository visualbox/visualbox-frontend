<template lang="pug">
v-container.base-toolbar(v-if="showToolbar")
  v-toolbar(
    color="transparent"
    flat clipped-left
  )
    img(
      @click="$router.push('/')"
      :src="require('../../assets/img/vbox-white.svg')"
    )
    v-toolbar-title(@click="$router.push('/')") VISUALBOX
    v-spacer
    v-toolbar-items
      v-btn(
        to="/docs"
        flat exact
      ) Docs
      v-btn(
        to="/auth"
        flat exact
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

  img
    width 40px
    cursor pointer

  .v-toolbar__title
    cursor pointer
    font-weight 300

  >>> .v-toolbar__content
    padding 0 0 0 16px !important
</style>
