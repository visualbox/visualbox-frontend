<template lang="pug">
#settings-ctx
  app-context-toolbar
    .subheading Settings

  //- List
  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      :to="item.to"
      exact
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action
        v-icon {{ item.icon }}
</template>

<script>
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'SettingsCtx',
  components: { AppContextToolbar },
  data: () => ({
    list: [
      { label: 'Account', icon: 'mdi-account-circle', to: '/app/s' },
      { label: 'Application', icon: 'mdi-settings', to: '/app/s/app' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
#settings-ctx
  .v-list
    padding 0
</style>
