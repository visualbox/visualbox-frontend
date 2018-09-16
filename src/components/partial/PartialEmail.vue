<template lang="pug">
div
  v-text-field.mb-3(
    v-model="internalValue"
    label="Email or phone"
    name="email"
    autofocus
    @keydown.enter="$emit('next')"
    tabindex="1"
  )
  v-layout(
    align-center
    justify-space-between
  )
    router-link(to="/auth/signup")
      base-link Create account
    base-btn.ma-0(
      :disabled="!value"
      prominent
      depressed
      @click="$emit('next')"
      tabindex="2"
    ) Next
</template>

<script>
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'PartialEmail',
  mixins: [ ProxyValue ]
}
</script>
