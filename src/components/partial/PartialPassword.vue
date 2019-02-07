<template lang="pug">
div
  v-text-field.mb-3(
    autofocus
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
    v-spacer
    v-btn.ma-0(
      :disabled="!value"
      :loading="isLoading"
      @click="$emit('next')"
      color="primary"
      prominent depressed
    ) Login
</template>

<script>
import { mapState } from 'vuex'
import { proxyValue } from '@/mixins'

export default {
  name: 'PartialPassword',
  mixins: [ proxyValue ],
  props: ['current'],
  computed: mapState('App', ['isLoading']),
  watch: {
    current (n) {
      if (n === 1)
        setTimeout(() => { this.$refs.password.focus() }, 300)
    }
  }
}
</script>
