<template lang="pug">
#integrations-ctx
  context-toolbar
    .subheading Manage Integrations
    v-spacer
    tooltip(text="Explore Integrations" :open-delay="800" bottom)
      v-btn.mr-1(@click="toggleExplorer" fab text)
        v-icon mdi-magnify
    tooltip(text="New Integration" :open-delay="800" bottom)
      v-btn(
        @click="addIntegration"
        :loading="isLoading"
        :disabled="isLoading"
        fab text
      )
        v-icon mdi-plus-box

  //- List
  v-list.hover-actions(dense)
    v-list-item(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/i/${item.id}`)"
    )
      v-list-item-content
        v-list-item-subtitle {{ item.settings.name || 'Untitled' }}
      v-list-item-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteIntegration(item.id)" small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'
import EventBus from '@/lib/eventBus'

export default {
  name: 'IntegrationsCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Integration', ['list'])
  },
  methods: {
    ...mapActions('Integration', ['del']),
    addIntegration () {
      EventBus.$emit('vbox:addIntegration')
    },
    toggleExplorer () {
      EventBus.$emit('vbox:toggleExplorer')
    },
    deleteIntegration (id) {
      if (confirm('Are you sure you want to delete the integration?'))
        this.del(id)
    }
  }
}
</script>
