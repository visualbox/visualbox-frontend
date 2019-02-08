<template lang="pug">
#display-public
  .grid-layout
    .grid-item
      .display-1.pa-3 {{ name }}
        .headline.mt-3
          v-btn.ma-0(
            flat outline
            color="primary"
            @click="submit"
            :loading="isLoading"
            :disabled="isLoading"
          ) Fork
      .markdown(v-html="compiledMarkdown")
</template>

<script>
import marked from 'marked'
import get from 'lodash-es/get'
import { mapState, mapActions, mapGetters } from 'vuex'
import { ContextToolbar } from '@/components'
import { fileContents, packageJson } from '@/lib/utils/projectUtils'

export default {
  name: 'DisplayPublic',
  props: ['type'],
  components: { ContextToolbar },
  data: () => ({
    loaded: null,
    createAction: null,
    urlPath: null
  }),
  computed: {
    ...mapState('App', ['isLoading']),
    files () {
      return get(this, 'loaded.files', null)
    },
    compiledMarkdown () {
      try {
        const contents = fileContents(this.files, ['README.md'])
        return contents ? marked(contents, { sanitize: true, gfm: true }) : 'No README.md'
      } catch (e) {
        return 'No README.md'
      }
    },
    name () {
      return packageJson(this.loaded, 'name', 'Untitled')
    }
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    async submit () {
      this.setIsLoading(true)
      try {
        const { id } = this.loaded
        await this.$store.dispatch(this.createAction, id)
        this.$router.push(`/app/${this.urlPath}`)
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  },
  mounted () {
    if (this.type === 'widget') {
      this.loaded = this.$store.state.Widget.public
      this.createAction = 'Widget/create'
      this.urlPath = 'w'
    } else {
      this.loaded = this.$store.state.Integration.public
      this.createAction = 'Integration/create'
      this.urlPath = 'i'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/styles/colors';

#display-public
  height 100%

  .grid-layout
    display grid
    position absolute
    top 0; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      .display-1
        background $vb-gutter

  .markdown
    padding 16px
</style>
