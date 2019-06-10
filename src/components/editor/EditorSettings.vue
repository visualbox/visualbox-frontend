<template lang="pug">
v-container#editor-settings(fill-height)
  v-layout(align-center justify-center)
    v-container
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="name"
            :disabled="isLoading"
            hide-details single-line
            outlined
          )
      .headline.mb-3.mt-4 Cover Image URL
      v-layout
        v-flex
          v-text-field(
            v-model="thumb"
            :disabled="isLoading"
            hide-details single-line
            outlined
          )

      //- Widget only have 'javascript' runtime
      template(v-if="runtime !== 'javascript'")
        .headline.mb-3.mt-4 Runtime
        v-layout
          v-flex
            select-runtime(
              v-model="runtime"
              disabled
            )
        v-layout.mt-2
          v-flex
            span.grey--text
              | The runtime can unfortunately not be changed after creation.
              | Please create a new project if you want to change the runtime.
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.px-3(
          @click="saveProject"
          :loading="isLoading"
          :disabled="isLoading"
          color="primary"
          large outlined
        )
          v-icon.mr-3 mdi-content-save
          | Save
      .headline.mb-3.mt-4 Download Code
      v-layout
        v-flex
          span.grey--text
            | Download all source code as a ZIP archive.
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.px-3(
          @click="downloadZip"
          color="primary"
          large outlined
        )
          v-icon.mr-3 mdi-cloud-download-outline
          | Download
      .headline.mb-3.mt-4 Publish to Registry
      v-layout
        v-flex
          span.grey--text
            | By publishing to the registry you allow other users to add your code to their dashboards.
            | The registry is versioned so you can safely update your code without breaking dashboards.
            | VisualBox uses <a href="https://semver.org/" target="_new">Semantic Versioning</a> for registry items.
      v-layout.mt-4(v-if="registryVersion > -1")
        v-spacer
        v-btn.ma-0.mr-3.px-3(
          v-if="registryVersion > 0"
          @click="depublishProject"
          color="red"
          large outlined
        ) Remove from Registry
        v-btn.ma-0.px-3(
          @click="publishProject"
          :loading="isLoading"
          :disabled="isLoading"
          color="primary"
          large outlined
        )
          v-icon.mr-3 mdi-publish
          | Publish
          template(v-if="registryVersion > 0") &nbsp;Version {{ registryVersion + 1 }}

      //- Published but later removed
      v-layout.mt-4(v-if="registryVersion < 0")
        v-flex
          span.red--text You cannot re-publish the project after it has been removed. Create a new project to publish again.
</template>

<script>
import semver from 'semver'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { SelectRuntime } from '@/components'
import { cloneDeep } from '@/lib/utils'
import EventBus from '@/lib/eventBus'
import { Zip } from '@/service'

export default {
  name: 'EditorSettings',
  components: { SelectRuntime },
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Project', ['settings']),
    ...mapGetters('Project', ['registryVersion']),
    name: {
      get () { return this.settings.name },
      set (value) { this.PROJECT_SET_SETTINGS({ key: 'name', value }) }
    },
    thumb: {
      get () { return this.settings.thumb },
      set (value) { this.PROJECT_SET_SETTINGS({ key: 'thumb', value }) }
    },
    runtime () { return this.settings.runtime }
  },
  methods: {
    ...mapMutations('Project', ['PROJECT_SET_SETTINGS']),
    ...mapActions('App', ['setSnackbar']),
    saveProject () {
      EventBus.$emit('vbox:saveProject')
    },
    publishProject () {
      EventBus.$emit('vbox:publishProject')
    },
    depublishProject () {
      if (confirm('You cannot re-publish to the registry once removed. Are you sure you want to continue?'))
        EventBus.$emit('vbox:depublishProject')
    },
    async downloadZip () {
      try {
        const base64 = await Zip.getBase64()
        window.location = `data:application/zip;base64,${base64}`
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#editor-settings
  max-width 800px
  padding 16px
  position absolute
  top 0; right 0; left 0; bottom 0;
</style>
