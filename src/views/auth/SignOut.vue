<template lang="pug">
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SignOut',
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['signOut'])
  },
  async mounted () {
    this.setIsLoading(true)
    try {
      await this.signOut()
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

<style lang="stylus" scoped>
.v-card
  height 370px

  .welcome
    height 40px
</style>
