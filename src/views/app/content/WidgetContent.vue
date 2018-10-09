<template lang="pug">
#widgets-index(ref="monaco")
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'WidgetsIndex',
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

<style lang="stylus" scoped>
#widgets-index
  height 100%
</style>
