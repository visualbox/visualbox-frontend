<template lang="pug">
#settings-ctx
  context-toolbar
    .subheading Settings

  //- List
  v-list(dense)
    v-list-item(
      v-for="(item, index) in list"
      :key="index"
      :to="item.to"
      exact
    )
      v-list-item-content
        v-list-item-subtitle {{ item.label }}
      v-list-item-action
        v-icon(color="white") {{ item.icon }}
</template>

<script lang="ts">
import Vue from 'vue'
import { ContextToolbar } from '@/components'

export default Vue.extend({
  name: 'SettingsCtx',
  components: { ContextToolbar },
  data: () => ({
    list: [
      { label: 'Account', icon: 'mdi-account-circle', to: '/app/s' },
      { label: 'Application', icon: 'mdi-settings', to: '/app/s/app' }
    ]
  })
})
</script>
