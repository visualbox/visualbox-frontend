<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center justify-center)
    v-flex(xs12 sm8 md5 lg4 xl3)
      component(
        :is="component"
        mode="out-in"
      )
        router-view
</template>

<script>
import { mapState } from 'vuex'
import authGuard from '@/mixins/authGuard'

export default {
  name: 'Auth',
  mixins: [ authGuard ],
  data: () => ({
    isReversing: false
  }),
  computed: {
    ...mapState('Route', ['meta']),
    component () {
      return this.isReversing
        ? 'v-scroll-x-transition'
        : 'v-scroll-x-reverse-transition'
    }
  },
  watch: {
    'meta.index' (cur, prev) {
      this.isReversing = cur < prev
    }
  }
}
</script>
