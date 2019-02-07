<template lang="pug">
editor(v-if="ready")
  helper-integration(slot="helper")
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components/editor'
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
          msg: `Saved integration`,
          timeout: 1000
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      }
    })

    const integration = this.integrationById()(this.$route.params.id)
    this.load(integration)
  },
  beforeDestroy () {
    EventBus.$off('vbox:saveProject')
    this.saveProject()
  }
}
</script>
