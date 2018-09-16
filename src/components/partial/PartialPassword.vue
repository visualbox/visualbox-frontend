<template lang="pug">
div
  v-text-field.mb-3(
    v-model="internalValue"
    label="Password"
    name="password"
    type="password"
    ref="password"
    :disabled="isLoading"
    :loading="isLoading"
    @keydown.enter="$emit('next')"
  )
  v-layout(
    align-center
    justify-space-between
  )
    router-link(to="/auth/forgot")
      base-link Forgot password?
    v-btn.ma-0(
      :disabled="!value"
      :loading="isLoading"
      color="primary"
      prominent
      depressed
      @click="$emit('next')"
    ) Next
</template>

<script>
import { mapGetters } from 'vuex'
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'PartialPassword',
  mixins: [ ProxyValue ],
  props: ['tab'],
  computed: mapGetters('App', ['isLoading']),
  watch: {
    tab (n) {
      if (n === 1)
        this.$refs.password.focus()
    }
  }
}
</script>
