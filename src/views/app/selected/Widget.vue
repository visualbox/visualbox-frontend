<template lang="pug">
#widget
  v-tabs(grow)
    v-tab Info
    v-tab Preview
    v-tab Readme
    v-tab Source

    v-tab-item
      span INFO
    v-tab-item
      span PREVIEW
    v-tab-item
      span README
    v-tab-item
      #editor(ref="monaco")
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'Widget',
  mounted () {
    monaco.editor.create(this.$refs.monaco, {
      value: [
        'function x() {',
        '\tconsole.log("Hello world!");',
        '}'
      ].join('\n'),
      language: 'javascript',
      theme: 'vs-dark'
    })
  }
}
</script>

<style lang="stylus">
#widget
  height 100%

  #editor
    height calc(100vh - 48px) !important
    position relative
    
    .monaco-editor
      width 100% !important
      height 100% !important
</style>
