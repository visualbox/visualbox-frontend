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
    v-btn.ma-0.mr-3(
      to="/auth/signup"
      color="primary"
      outline
    ) Create account
    v-spacer
    v-btn.ma-0(
      :disabled="!value"
      @click="$emit('next')"
      color="primary"
      prominent depressed
      tabindex="2"
    ) Next
</template>

<script lang="ts">
import Vue from 'vue'
import { proxyValue } from '@/mixins'

export default Vue.extend({
  name: 'PartialEmail',
  mixins: [ proxyValue ]
})
</script>
