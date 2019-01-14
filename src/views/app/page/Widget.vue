<template lang="pug">
#widget(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-tabs.elevation-0(
      v-model="localTab"
      color="rgba(0,0,0,0)"
      slider-color="primary"
      grow
    )
      v-tab Widget
      v-tab Info
      v-tab Source
      v-tab Config

  .tabs-items
    .tab-item.pa-3.scroll(:class="{ 'active' : localTab === 0 }")
      .markdown(v-html="compiledMarkdown")
    .tab-item(:class="{ 'active' : localTab === 1 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        ref="editorReadme"
        v-model="readme"
        language="markdown"
      )
    .tab-item(:class="{ 'active' : localTab === 2 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        ref="editorSource"
        v-model="source"
        language="html"
      )
    .tab-item(:class="{ 'active' : localTab === 3 }")
      monaco-editor(
        :theme="'vs-' + theme"
        class="editor"
        ref="editorConfig"
        v-model="config"
        language="json"
      )
    .tab-item(:class="{ 'active' : localTab === 4 }")
      span PREVIEW
</template>

<script>
import marked from 'marked'
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, MonacoEditor } from '@/components/app'

export default {
  name: 'Widget',
  components: {
    AppContextToolbar,
    MonacoEditor
  },
  watch: {
    loaded: {
      handler: _.debounce(async function (newVal, oldVal) {
        // Don't display 'Saved changes' when changing widget
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
    ...mapState('Widget', ['loaded', 'tab']),
    ...mapGetters('App', ['theme']),
    localTab: {
      get () {
        return this.tab
      },
      set: function (val) {
        this.WIDGET_SET_TAB(val)
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
    }
  },
  methods: {
    ...mapMutations('Widget', ['WIDGET_SET_TAB']),
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Widget', ['load', 'updateLoaded', 'closeLoaded', 'commitLoaded']),
    updateDimensions () {
      this.$refs.editorReadme.getMonaco().layout()
      this.$refs.editorSource.getMonaco().layout()
      this.$refs.editorConfig.getMonaco().layout()
    }
  },
  mounted () {
    this.load(this.$route.params.id)
    this.$nextTick(function () {
      window.addEventListener('resize', this.updateDimensions)
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateDimensions)
    this.closeLoaded()
  }
}
</script>

<style lang="stylus" scoped>
#widget
  height 100%

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
