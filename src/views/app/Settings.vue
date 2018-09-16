<template lang="pug">
#settings
  app-context-toolbar
    .subheading Settings
    v-spacer
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'Settings',
  components: { AppContextToolbar }
}
</script>

<style lang="stylus" scoped>
</style>
