<template lang="pug">
#integration(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-tabs.editor-tabs(
      v-model="localTab"
      color="transparent"
      slider-color="primary"
    )
      v-tab(:ripple="false").black
        v-icon mdi-home-variant
      v-tab(
        v-for="(item, index) in listFiles"
        :key="index"
        :ripple="false"
      )
        v-icon.mr-2(
          :color="FILE_TYPES[item.file].color"
          small
        ) {{ FILE_TYPES[item.file].icon }}
        | {{ item.text}}
      v-spacer
      v-toolbar-items
        v-btn(
          @click="formatCode"
          flat
        )
          v-icon mdi-format-align-left
        v-btn(
          @click="showHelper = !showHelper"
          flat
        )
          v-icon mdi-powershell

  .tabs-items
    .tab-item.pa-3.scroll(:class="{ 'active' : localTab === 0 }")
      .markdown(v-html="compiledMarkdown")
    .tab-item(:class="{ 'active' : localTab === 1 }")
      monaco-editor(
        :theme="'vs-' + theme"
        v-model="config"
        ref="config"
        language="json"
      )
    .tab-item(:class="{ 'active' : localTab === 2 }")
      monaco-editor(
        :theme="'vs-' + theme"
        v-model="source"
        ref="source"
        language="javascript"
      )
    .tab-item(:class="{ 'active' : localTab === 3 }")
      monaco-editor(
        :theme="'vs-' + theme"
        v-model="package"
        ref="package"
        language="json"
      )
    .tab-item(:class="{ 'active' : localTab === 4 }")
      monaco-editor(
        :theme="'vs-' + theme"
        v-model="readme"
        ref="readme"
        language="markdown"
      )
    helper-integration(v-if="showHelper")
</template>

<script>
import marked from 'marked'
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, MonacoEditor } from '@/components/app'
import { HelperIntegration } from '@/components/helper'
import FILE_TYPES from '@/lib/fileTypes'

export default {
  name: 'Integration',
  components: {
    AppContextToolbar,
    HelperIntegration,
    MonacoEditor
  },
  data: () => ({
    showHelper: false,
    FILE_TYPES,
    listFiles: [
      { text: 'config.json', file: 'json', tab: 1 },
      { text: 'index.js', file: 'js', tab: 2 },
      { text: 'package.json', file: 'json', tab: 3 },
      { text: 'README.md', file: 'md', tab: 4 }
    ]
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
    ...mapActions('Integration', ['load', 'updateLoaded', 'closeLoaded', 'commitLoaded']),
    formatCode () {
      let ref = null
      if (this.localTab === 1)
        ref = this.$refs.config
      else if (this.localTab === 2)
        ref = this.$refs.source
      else if (this.localTab === 3)
        ref = this.$refs.package
      else if (this.localTab === 4)
        ref = this.$refs.readme
      if (ref === null)
        return

      ref.getMonaco().trigger('anyString', 'editor.action.formatDocument')
    }
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

        > div
          height 100%

      &.scroll
        overflow auto

        .markdown
          word-wrap break-word

          img
            max-width 100%
</style>
