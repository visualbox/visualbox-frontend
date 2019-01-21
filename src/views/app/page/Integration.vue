<template lang="pug">
#integration(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-tabs.editor-tabs(
      v-model="localTab"
      color="rgba(0,0,0,0)"
      slider-color="primary"
    )
      v-tab.primary
        v-icon mdi-home
      v-tab
        v-icon(
          :color="FILE_TYPES['json'].color"
          small
        ) {{ FILE_TYPES['json'].icon }}
        | config.json
      v-tab
        v-icon(
          :color="FILE_TYPES['js'].color"
          small
        ) {{ FILE_TYPES['js'].icon }}
        | index.js
      v-tab
        v-icon(
          :color="FILE_TYPES['json'].color"
          small
        ) {{ FILE_TYPES['json'].icon }}
        | package.json
      v-tab
        v-icon(
          :color="FILE_TYPES['md'].color"
          small
        ) {{ FILE_TYPES['md'].icon }}
        | README.md
  .tabs-items
    .tab-item.pa-3.scroll(:class="{ 'active' : localTab === 0 }")
      .markdown(v-html="compiledMarkdown")
    .tab-item(:class="{ 'active' : localTab === 1 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        v-model="config"
        language="json"
      )
    .tab-item(:class="{ 'active' : localTab === 2 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        v-model="source"
        language="javascript"
      )
    .tab-item(:class="{ 'active' : localTab === 3 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        v-model="package"
        language="json"
      )
    .tab-item(:class="{ 'active' : localTab === 4 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        v-model="readme"
        language="markdown"
      )
</template>

<script>
import marked from 'marked'
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, MonacoEditor } from '@/components/app'
import { FILE_TYPES } from '@/lib/fileTypes'

export default {
  name: 'Integration',
  components: {
    AppContextToolbar,
    MonacoEditor
  },
  data: () => ({
    FILE_TYPES
  }),
  watch: {
    loaded: {
      handler: _.debounce(async function (newVal, oldVal) {
        // Don't display 'Saved changes' when changing integration
        if (newVal === null || oldVal === null || newVal.id !== oldVal.id)
          return

        try {
          await this.commitLoaded()
          this.setSnackbar({
            type: 'info',
            msg: `Saved changes`,
            timeout: 1500
          })
        } catch (e) {}
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    }
  },
  computed: {
    ...mapState('Integration', ['loaded', 'tab']),
    ...mapGetters('App', ['theme']),
    localTab: {
      get () {
        return this.tab
      },
      set: function (val) {
        this.INTEGRATION_SET_TAB(val)
      }
    },
    compiledMarkdown () {
      try {
        return marked(this.readme, {
          sanitize: true,
          gfm: true
        })
      } catch (e) {
        return null
      }
    },
    readme: {
      get () {
        return _.get(this, 'loaded.readme', '')
      },
      set (readme) {
        this.updateLoaded({ readme })
      }
    },
    source: {
      get () {
        return _.get(this, 'loaded.source', '')
      },
      set (source) {
        this.updateLoaded({ source })
      }
    },
    config: {
      get () {
        return _.get(this, 'loaded.config', '')
      },
      set (config) {
        this.updateLoaded({ config })
      }
    },
    package: {
      get () {
        try {
          return JSON.stringify(_.get(this, 'loaded.package', '{}'), null, 2)
        } catch (e) {
          return '{}'
        }
      },
      set (pkg) {
        try {
          this.updateLoaded({ package: JSON.parse(pkg) })
        } catch (e) {}
      }
    }
  },
  methods: {
    ...mapMutations('Integration', ['INTEGRATION_SET_TAB']),
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Integration', ['load', 'updateLoaded', 'closeLoaded', 'commitLoaded'])
  },
  mounted () {
    this.load(this.$route.params.id)
  },
  beforeDestroy () {
    this.closeLoaded()
  }
}
</script>

<style lang="stylus" scoped>
#integration
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

  >>> .tabs-items
    height calc(100% - 48px)
    position relative

    .tab-item
      position absolute
      top 0
      bottom 0
      left 0
      right 0
      visibility hidden

      &.active
        visibility visible

      &.scroll
        overflow auto

        .markdown
          word-wrap break-word

          img
            max-width 100%

  >>> .editor
    height 100%
</style>
