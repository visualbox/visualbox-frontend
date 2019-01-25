<template lang="pug">
#settings-ctx
  context-toolbar
    .subheading Settings

  //- List
  v-list(dense)
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
import { ContextToolbar } from '@/components'

export default {
  name: 'SettingsCtx',
  components: { ContextToolbar },
  data: () => ({
    list: [
      { label: 'Account', icon: 'mdi-account-circle', to: '/app/s' },
      { label: 'Application', icon: 'mdi-settings', to: '/app/s/app' }
    ]
  })
}
</script>
