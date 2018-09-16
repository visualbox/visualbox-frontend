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
    v-btn.ma-0(
      to="/auth/signup"
      color="primary"
      outline
    ) Create account
    v-btn.ma-0(
      :disabled="!value"
      @click="$emit('next')"
      color="primary"
      prominent depressed
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
