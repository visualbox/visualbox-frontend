<template lang="pug">
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Verify',
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['confirmUser'])
  },
  async mounted () {
    try {
      let { code, email } = this.$route.params
      email = Buffer.from(email, 'base64').toString()

      this.setIsLoading(true)
      try {
        await this.confirmUser({
          username: email,
          code: code
        })
        this.setSnackbar({
          type: 'success',
          msg: `Account verified. You may now login`
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
        this.$router.push('/auth')
      }
    } catch (e) {
      this.$router.push('/auth')
    }
  }
}
</script>
