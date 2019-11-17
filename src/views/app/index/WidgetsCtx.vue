<template lang="pug">
#widgets-ctx
  context-toolbar
    .subheading Manage Widgets
    v-spacer
    tooltip(text="Explore Widgets" :open-delay="800" bottom)
      v-btn.mr-1(@click="toggleExplorer" text fab small)
        v-icon mdi-magnify
    tooltip(text="New Widget" :open-delay="800" bottom)
      v-btn(
        @click="addWidget"
        :loading="isLoading"
        :disabled="isLoading"
        text fab small
      )
        v-icon mdi-plus-box

  //- List
  v-list.hover-actions(dense)
    v-list-item(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/w/${item.id}`)"
    )
      v-list-item-content
        v-list-item-subtitle {{ item.settings.name || 'Untitled' }}
      v-list-item-action
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
