<template lang="pug">
editor(v-if="ready")
  helper-widget(slot="helper")
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components/editor'
import { HelperWidget } from '@/components/helper'
import EventBus from '@/lib/eventBus'

export default {
  name: 'Widget',
  components: {
    Editor,
    HelperWidget
  },
  computed: mapState('Project', ['ready', 'id']),
  methods: {
    ...mapGetters('Widget', ['widgetById']),
    ...mapActions('Widget', [
      'signedUrl',
      'commit',
      'commitFiles',
      'publish',
      'depublish'
    ]),
    ...mapMutations('Project', ['PROJECT_RESET']),
    ...mapActions('Project', [
      'load',
      'save',
      'saveFiles'
    ]),
    ...mapActions('App', [
      'setSnackbar',
      'setIsLoading'
    ]),
    async saveProject (files) {
      try {
        // Save files only
        if (files) {
          await this.commitFiles(await this.saveFiles())

        // Save integration metadata
        } else
          await this.commit(await this.save())
      } catch (e) {
        throw e
      }
    }
  },
  async mounted () {
    EventBus.$on('vbox:saveProject', async (files = false) => {
      try {
        this.setIsLoading(true)
        await this.saveProject(files)
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
      } finally {
        this.setIsLoading(false)
      }
    })

    // Should save project before publish?
    EventBus.$on('vbox:publishProject', async () => {
      try {
        this.setIsLoading(true)
        await this.publish(this.id)
        this.setSnackbar({
          type: 'info',
          msg: `Published widget`,
          timeout: 1000
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    })

    // Should save project before publish?
    EventBus.$on('vbox:depublishProject', async () => {
      try {
        this.setIsLoading(true)
        await this.depublish(this.id)
        this.setSnackbar({
          type: 'info',
          msg: `Removed from registry`,
          timeout: 1000
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    })

    try {
      const widget = this.widgetById()(this.$route.params.id)
      const signedUrl = await this.signedUrl(widget)
      await this.load({
        project: widget,
        signedUrl
      })
    } catch (e) {
      this.setSnackbar({
        type: 'error',
        msg: e.message
      })
    }
  },
  async beforeDestroy () {
    EventBus.$off('vbox:saveProject')
    EventBus.$off('vbox:publishProject')
    EventBus.$off('vbox:depublishProject')

    try {
      await Promise.all([
        this.saveProject(),
        this.saveProject(true)
      ])
      this.PROJECT_RESET()
    } catch (e) {
      this.setSnackbar({
        type: 'error',
        msg: e.message
      })
    }
  }
}
</script>
