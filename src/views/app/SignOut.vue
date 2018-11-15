<template lang="pug">
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SignOut',
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar', 'reset']),
    ...mapActions('Cognito', ['signOut'])
  },
  async mounted () {
    this.setIsLoading(true)
    try {
      await this.signOut()
      this.reset()
    } catch (e) {
      this.setSnackbar({
        type: 'error',
        msg: e.message
      })
    } finally {
      this.setIsLoading(false)
      this.$router.push('/')
    }
  }
}
</script>
