<template lang="pug">
editor(v-if="ready")
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components'
import { HelperIntegration } from '@/components/helper'
import EventBus from '@/lib/eventBus'

export default {
  name: 'Integration',
  components: {
    Editor,
    HelperIntegration
  },
  computed: mapState('Project', ['ready']),
  methods: {
    ...mapGetters('Integration', ['integrationById']),
    ...mapActions('Integration', ['commit']),
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

    const integration = this.integrationById()(this.$route.params.id)
    this.load(integration)
  },
  beforeDestroy () {
    EventBus.$off('vbox:saveProject')

    this.saveProject()
  }
}
</script>
