<template lang="pug">
#settings-ctx
  app-context-toolbar
    .subheading Settings
    v-spacer
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'
export default {
  name: 'SettingsCtx',
  components: { AppContextToolbar }
}
</script>

<style lang="stylus" scoped>
</style>
