<template lang="pug">
v-app(dark)
  base-snackbar
  base-toolbar

  v-content
    router-view(v-if="isReady")
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters('App', ['isReady']),
    ...mapState('Route', ['path'])
  },
  methods: mapActions('App', ['setIsReady', 'setSnackbar']),
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
