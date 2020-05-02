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

      //- Publish to registry
      .headline.mb-3.mt-4 Publish to Registry
      v-layout
        v-flex
          span.grey--text
            | By publishing to the registry you allow other users to add your code to their dashboards.
            | The registry is versioned so you can safely update your code without breaking dashboards.
            | VisualBox uses <a href="https://semver.org/" target="_new">Semantic Versioning</a> for registry items.

      //- 0    - not been published before
      //- -1   - published but later removed
      //- else - latest version
      v-layout.mt-4(v-if="registryVersion === -1")
        v-flex
          span.red--text You cannot re-publish the project after it has been removed. Create a new project to publish again.

      template(v-else)
        v-layout.mt-4
          v-flex
            v-text-field(
              v-model="newSemver"
              :disabled="isLoading"
              hide-details single-line
              outlined
            )
        v-layout.mt-2(v-if="registryVersion !== 0")
          v-flex
            span.grey--text
              | Current version: {{ registryVersion }}
        v-layout.mt-4
          v-spacer
          v-btn.ma-0.mr-3.px-3(
            v-if="registryVersion !== 0"
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
</template>

<script>
import semver from 'semver'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { cloneDeep } from '@/lib/utils'
import EventBus from '@/lib/eventBus'
import { Zip } from '@/service'

export default {
  name: 'EditorSettings',
  data: () => ({
    newSemver: null
  }),
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
    }
  },
  methods: {
    ...mapMutations('Project', ['PROJECT_SET_SETTINGS']),
    ...mapActions('App', ['setSnackbar']),
    saveProject () {
      EventBus.$emit('vbox:saveProject')
    },
    publishProject () {
      if (this.registryVersion === -1)
        return

      // Validate semVer
      let newVersion = semver.coerce(this.newSemver)
      if (!newVersion) {
        this.setSnackbar({
          type: 'error',
          msg: 'Version is invalid'
        })
        return
      }

      newVersion = semver.valid(newVersion)
      if (!newVersion) {
        this.setSnackbar({
          type: 'error',
          msg: 'Version is invalid'
        })
        return
      }

      const previousVersion = this.registryVersion === 0
        ? '0.0.0'
        : this.registryVersion
      if (!semver.gt(newVersion, previousVersion)) {
        this.setSnackbar({
          type: 'error',
          msg: 'Version must be greater than previous version'
        })
        return
      }

      this.newSemver = newVersion
      EventBus.$emit('vbox:publishProject', this.newSemver)
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
  },
  mounted () {
    this.newSemver = this.registryVersion || '1.0.0'
  }
}
</script>

<style lang="stylus" scoped>
@import '../../styles/colors';

#editor-settings
  max-width 800px
  padding 16px
  position absolute
  top 0; right 0; left 0; bottom 0;
</style>
