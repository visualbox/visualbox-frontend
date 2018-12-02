<template lang="pug">
#widget-public(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-tabs.elevation-0(
      v-model="tab"
      color="rgba(0,0,0,0)"
      slider-color="primary"
      grow
    )
      v-tab Widget
      v-tab Source
      v-tab Config

  .tabs-items
    .tab-item.pa-3.scroll(:class="{ 'active' : tab === 0 }")
      .item-header.mb-3
        .display-1.pa-3 {{ loaded.label }}
        .headline.pr-3.pl-3.pb-3
          v-btn.ma-0(
            flat outline
            color="primary"
          )
            v-icon(left) mdi-content-copy
            | Copy widget
        v-divider
      .markdown(v-html="compiledMarkdown")
    .tab-item(:class="{ 'active' : tab === 1 }")
      monaco-editor(
        class="editor"
        ref="editorSource"
        v-model="loaded.source"
        language="html"
        :options="monacoOptions"
      )
    .tab-item(:class="{ 'active' : tab === 2 }")
      monaco-editor(
        class="editor"
        ref="editorConfig"
        v-model="loaded.config"
        language="json"
        :options="monacoOptions"
      )
</template>

<script>
import marked from 'marked'
import { mapState, mapActions } from 'vuex'
import { AppContextToolbar, MonacoEditor } from '@/components/app'

export default {
  name: 'Widget',
  components: {
    AppContextToolbar,
    MonacoEditor
  },
  data: () => ({
    tab: 0,
    monacoOptions: {
      readOnly: true
    }
  }),
  watch: {
    '$route.params.id': function () {
      this.loadPublic(this.$route.params.id)
      this.tab = 0
    }
  },
  computed: {
    ...mapState('Widget', ['public']),
    loaded () {
      try {
        const item = this.public.find(item => item.id === this.$route.params.id)
        return typeof item === 'undefined' ? null : item
      } catch (e) {
        return null
      }
    },
    compiledMarkdown () {
      try {
        return marked(this.loaded.readme, {
          sanitize: true,
          gfm: true
        })
      } catch (e) {
        return null
      }
    }
  },
  methods: {
    ...mapActions('Widget', ['loadPublic']),
    updateDimensions () {
      this.$refs.editorSource.getMonaco().layout()
      this.$refs.editorConfig.getMonaco().layout()
    }
  },
  mounted () {
    this.loadPublic(this.$route.params.id)
    this.$nextTick(function () {
      window.addEventListener('resize', this.updateDimensions)
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateDimensions)
  }
}
</script>

<style lang="stylus" scoped>
#widget-public
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

        .item-header
          margin -16px -16px 0

        .markdown
          word-wrap break-word

          img
            max-width 100%

  >>> .editor
    height 100%
</style>
