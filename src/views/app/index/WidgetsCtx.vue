<template lang="pug">
#widgets-ctx
  context-toolbar
    .subheading Manage Widgets
    v-spacer
    v-btn(
      @click="toggleExplorer"
      icon
    )
      v-icon mdi-magnify
    v-btn(
      icon
      @click="addWidget"
      :loading="isLoading"
      :disabled="isLoading"
    )
      v-icon mdi-plus-box

  //- List
  v-list.hover-actions(dense)
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/w/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.settings.name || 'Untitled' }}
      v-list-tile-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteWidget(item.id)" small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'
import EventBus from '@/lib/eventBus'

export default {
  name: 'WidgetsCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Widget', ['list'])
  },
  methods: {
    ...mapActions('Widget', ['del']),
    addWidget () {
      EventBus.$emit('vbox:addWidget')
    },
    toggleExplorer () {
      EventBus.$emit('vbox:toggleExplorer')
    },
    deleteWidget (id) {
      if (confirm('Are you sure you want to delete the widget?'))
        this.del(id)
    }
  }
}
</script>
