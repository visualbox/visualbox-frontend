<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center justify-center)
    v-flex(xs12 sm8 md5 lg4 xl3)
      v-fade-transition(mode="out-in")
        router-view
</template>

<script>
import authGuard from '@/mixins/authGuard'

export default {
  name: 'Auth',
  mixins: [ authGuard ]
}
</script>
