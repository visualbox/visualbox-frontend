<template lang="pug">
editor(v-if="ready")
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components/editor'
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
        await this.commit(await this.save())
      } catch (e) {
        throw e
      }
    }
  },
  mounted () {
    EventBus.$on('vbox:saveProject', async () => {
      try {
        await this.saveProject()
        this.setSnackbar({
          type: 'info',
          msg: `Saved widget`,
          timeout: 1000
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      }
    })

    const widget = this.widgetById()(this.$route.params.id)
    this.load(widget)
  },
  beforeDestroy () {
    EventBus.$off('vbox:saveProject')
    this.saveProject()
  }
}
</script>
