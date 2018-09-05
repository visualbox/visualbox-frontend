<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center justify-center)
    v-flex(xs12 sm8 md5)
      router-view
</template>

<script>
import authGuard from '@/mixins/authGuard'

export default {
  name: 'Auth',
  mixins: [ authGuard ]
}
</script>
