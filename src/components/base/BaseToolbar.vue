<template lang="pug">
v-toolbar.elevation-0(app dark)
  v-spacer
  v-toolbar-items
    v-btn(
      to="/auth"
      flat
    ) Login
</template>

<script>
import mapApp from '@/mixins/mapApp'

export default {
  name: 'BaseToolbar',
  mixins: [ mapApp ]
}
</script>
