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
            outline
          )
      .headline.mb-3.mt-4 Runtime
      v-layout
        v-flex
          select-runtime(
            v-model="runtime"
            :loading="isLoading"
          )
      v-layout.mt-4
        v-spacer
        v-btn.ma-0(
          @click="saveProject"
          :loading="isLoading"
          :disabled="isLoading"
          color="primary"
          large outline
        ) Save
      .headline.mb-3.mt-4 Publish to Registry
      v-layout
        v-flex
          span.grey--text
            | By publishing to the registry you allow other users to add your code to their dashboards.
            | The registry is versioned so you can safely update your code without breaking dashboards.
      v-layout.mt-4(v-if="registryVersion > -1")
        v-spacer
        v-btn.ma-0.mr-3(
          v-if="registryVersion > 0"
          @click="depublishProject"
          color="red"
          large outline
        ) Remove from Registry
        v-btn.ma-0(
          @click="publishProject"
          :loading="isLoading"
          :disabled="isLoading"
          color="primary"
          large outline
        )
          | Publish
          template(v-if="registryVersion > 0") &nbsp;Version {{ registryVersion + 1 }}

      //- Published but later removed
      v-layout.mt-4(v-if="registryVersion < 0")
        v-flex
          span.red--text You cannot re-publish the project after it has been removed. Create a new project to publish again.
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { SelectRuntime } from '@/components'
import { cloneDeep } from '@/lib/utils'
import EventBus from '@/lib/eventBus'

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
    runtime: {
      get () { return this.settings.runtime },
      set (value) { this.PROJECT_SET_SETTINGS({ key: 'runtime', value }) }
    }
  },
  methods: {
    ...mapMutations('Project', ['PROJECT_SET_SETTINGS']),
    saveProject () {
      EventBus.$emit('vbox:saveProject')
    },
    publishProject () {
      EventBus.$emit('vbox:publishProject')
    },
    depublishProject () {
      if (confirm('You cannot re-publish to the registry once removed. Are you sure you want to continue?'))
        EventBus.$emit('vbox:depublishProject')
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
  overflow hidden
</style>
