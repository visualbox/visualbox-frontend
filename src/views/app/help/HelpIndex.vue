<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)
    .markdown(v-html="compiledMarkdown")
</template>

<script>
import marked from 'marked'

export default {
  name: 'HelpIndex',
  computed: {
    compiledMarkdown () {
      try {
        const fileName = this.$route.params.page ? this.$route.params.page : 'index'
        const file = require(`./${fileName}.md`)
        return marked(file, {
          sanitize: true,
          gfm: true
        })
      } catch (e) {
        return null
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
