<template lang="pug">
div
  v-text-field.mb-3(
    v-model="internalValue"
    label="Email or phone"
    name="email"
    autofocus
  )
  v-layout(
    align-center
    justify-space-between
  )
    router-link(to="/auth/signup")
      base-link Create account
    base-btn(
      :disabled="!value"
      prominent
      @click="$emit('next')"
    ) Next
</template>

<script>
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'PartialEmail',
  mixins: [ ProxyValue ]
}
</script>
