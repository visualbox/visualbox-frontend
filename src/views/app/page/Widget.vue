<template lang="pug">
#widget
  app-context-toolbar
    v-tabs.elevation-0(
      v-model="tab"
      color="rgba(0,0,0,0)"
      slider-color="primary"
      grow
    )
      v-tab Info
      v-tab Edit Info
      v-tab Source
      v-tab Preview

  .tabs-items
    .tab-item.pa-3(:class="{ 'active' : tab === 0 }")
      span INFO
    .tab-item(:class="{ 'active' : tab === 1 }")
      #editor-info(ref="editorInfo")
    .tab-item(:class="{ 'active' : tab === 2 }")
      #editor-source(ref="editorSource")
    .tab-item(:class="{ 'active' : tab === 3 }")
      span PREVIEW
</template>

<script>
import * as monaco from 'monaco-editor'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'Widget',
  components: { AppContextToolbar },
  data: () => ({
    tab: 0,
    editorSource: null,
    editorInfo: null
  }),
  methods: {
    updateDimensions () {
      this.editorInfo.layout()
      this.editorSource.layout()
    }
  },
  mounted () {
    this.editorInfo = monaco.editor.create(this.$refs.editorInfo, {
      value: [
        'function x() {',
        '\tconsole.log("Edit Info");',
        '}'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    })
    this.editorSource = monaco.editor.create(this.$refs.editorSource, {
      value: [
        'function x() {',
        '\tconsole.log("Edit Source");',
        '}'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    })
    window.addEventListener('resize', this.updateDimensions)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateDimensions)
  }
}
</script>

<style lang="stylus">
#widget
  height 100%

  .tabs-items
    height 100%
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

  #editor-info, #editor-source
    height 100%
</style>
