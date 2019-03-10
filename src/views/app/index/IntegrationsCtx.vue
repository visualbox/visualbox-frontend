<template lang="pug">
#integrations-ctx
  context-toolbar
    .subheading Manage Integrations
    v-spacer
    v-btn(
      @click="toggleExplorer"
      icon
    )
      v-icon mdi-magnify
    v-btn(
      @click="addIntegration"
      :loading="isLoading"
      :disabled="isLoading"
      icon
    )
      v-icon mdi-plus-box

  //- List
  v-list.hover-actions(dense)
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/i/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.settings.name || 'Untitled' }}
      v-list-tile-action
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
