<template lang="pug">
editor(v-if="ready")
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components'
// import { HelperWidget } from '@/components/helper'
import EventBus from '@/lib/eventBus'

export default {
  name: 'Widget',
  components: {
    Editor
    // HelperWidget
  },
  computed: mapState('Project', ['ready']),
  methods: {
    ...mapGetters('Widget', ['widgetById']),
    ...mapActions('Widget', ['commit']),
    ...mapActions('Project', ['load', 'save']),
    ...mapActions('App', ['setSnackbar']),
    async saveProject () {
      try {
        const project = await this.save()
        await this.commit(project)
        this.setSnackbar({
          type: 'info',
          msg: `Saved changes`,
          timeout: 1500
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      }
    }
  },
  mounted () {
    EventBus.$on('vbox:saveProject', this.saveProject)

    const widget = this.widgetById()(this.$route.params.id)
    this.load(widget)
  },
  beforeDestroy () {
    EventBus.$off('vbox:saveProject')

    this.saveProject()
  }
}
</script>
