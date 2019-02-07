<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h1.headline.mb-3 Forgot Password
      .subheading provide your email and get a new password

    div
      v-text-field.mb-3(
        v-model="email"
        :rules="[rules.required('Enter your email')]"
        label="Email"
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
        :disabled="!email"
        :loading="isLoading"
        @click="submit"
        color="primary"
        prominent depressed
      ) Next
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { BaseCard } from '@/components/base'

export default Vue.extend({
  name: 'Verify',
  components: { BaseCard },
  data: () => ({
    email: undefined,
    rules: {
      required: (msg: string) => (v: boolean) => !!v || msg
    }
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['forgotPassword']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.forgotPassword({
          username: this.email
        })
        this.setSnackbar({
          type: 'success',
          msg: `Instructions has been sent to your email`
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
  }
})
</script>
