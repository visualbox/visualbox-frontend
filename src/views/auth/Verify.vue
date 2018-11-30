<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h1.headline.mb-3 Verify
      .subheading with the code sent to your email

    div
      v-text-field.mb-3(
        v-model="code"
        :rules="[rules.required('Enter verification code')]"
        label="Code"
        autofocus
        @keydown.enter="submit"
      )

    v-layout(
      align-center
      justify-space-between
    )
      v-btn.ma-0(
        v-if="false"
        to="/auth/resend"
        color="primary"
        outline
      ) Resend verification
      v-spacer
      v-btn.ma-0(
        :disabled="!code"
        :loading="isLoading"
        @click="submit"
        color="primary"
        prominent depressed
      ) Next
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { BaseCard } from '@/components/base'

export default {
  name: 'Verify',
  components: { BaseCard },
  data: () => ({
    email: undefined,
    code: undefined,
    rules: {
      required: msg => v => !!v || msg
    }
  }),
  computed: mapGetters('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['confirmUser']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.confirmUser({
          username: this.email,
          code: this.code
        })
        this.setSnackbar({
          type: 'success',
          msg: `Account verified. You may now login`
        })
        this.$router.push('/auth')
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  },
  mounted () {
    this.email = this.$route.params.email
  }
}
</script>

<style lang="stylus" scoped>
</style>
