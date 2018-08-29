<template lang="pug">
v-app
  base-snackbar
  base-toolbar

  v-content
    v-fade-transition(appear)
      router-view(v-if="isReady")
</template>

<script>
import mapApp from '@/mixins/mapApp'

export default {
  name: 'App',
  mixins: [ mapApp ],
  async mounted () {
    try {
      await this.$store.dispatch('Cognito/fetchSession')
    } catch (e) {
      // Silent
    } finally {
      this.setIsReady(true)
      this.setSnackbar({ msg: 'App inited' })
    }
  }
}
</script>

<style lang="stylus" scoped>
#app
  font-family "Hind Vadodara", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
</style>
