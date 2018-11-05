<template lang="pug">
v-app(dark)
  base-snackbar
  base-toolbar

  v-content
    router-view(v-if="sessionIsReady")
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { BaseToolbar, BaseSnackbar } from '@/components/base'

export default {
  name: 'App',
  components: {
    BaseToolbar,
    BaseSnackbar
  },
  computed: {
    ...mapGetters('App', ['sessionIsReady']),
    ...mapState('Route', ['path'])
  },
  methods: mapActions('App', ['initSession', 'setSnackbar']),
  async mounted () {
    try {
      await this.initSession()
    } catch (e) {
      // Silent
    } finally {
      this.setSnackbar({ msg: 'App inited' })
    }
  }
}
</script>
