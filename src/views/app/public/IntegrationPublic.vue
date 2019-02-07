<template lang="pug">
#integration-public(v-if="loaded")
  context-toolbar
    v-tabs.editor-tabs(
      v-model="tab"
      color="transparent"
      slider-color="primary"
    )
      v-tab(:ripple="false").black
        v-icon mdi-card-text
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

  .grid-layout
    .grid-item(v-if="tab === 0")
      .display-1.pa-3 {{ loaded.label }}
        .headline.mt-3
          v-btn.ma-0(
            flat outline
            color="primary"
            @click="submit"
            :loading="isLoading"
            :disabled="isLoading"
          )
            v-icon(left) mdi-content-copy
            | Copy integration
      .markdown(v-html="compiledMarkdown")
    .grid-item(v-if="tab !== 0")
      .monaco
        monaco-editor(
          v-model="editorModel"
          :theme="'vs-' + theme"
          :options="monacoOptions"
          :language="file.monacoSyntax"
        )
</template>

<script>
import marked from 'marked'
import get from 'lodash-es/get'
import { mapState, mapActions, mapGetters } from 'vuex'
import { ContextToolbar } from '@/components'

export default {
  name: 'IntegrationPublic',
  components: { ContextToolbar },
  data: () => ({
    tab: 0,
    monacoOptions: {
      readOnly: true
    },
    listFiles: [
      {
        text: 'config.json',
        key: 'config',
        file: 'json',
        monacoSyntax: 'json',
        tab: 1
      },
      {
        text: 'index.js',
        key: 'source',
        file: 'js',
        monacoSyntax: 'javascript',
        tab: 2
      },
      {
        text: 'package.json',
        key: 'package',
        file: 'json',
        monacoSyntax: 'json',
        tab: 3
      },
      {
        text: 'README.md',
        key: 'readme',
        file: 'md',
        monacoSyntax: 'markdown',
        tab: 4
      }
    ]
  }),
  watch: {
    async '$route.params.id' () {
      this.tab = 0
      try {
        await this.loadPublic(this.$route.params.id)
      } catch (e) {
        this.$router.push('/app/w')
      }
    }
  },
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Integration', ['public']),
    ...mapGetters('App', ['theme']),
    loaded () {
      try {
        const item = this.public.find(({ id }) => id === this.$route.params.id)
        return item || null
      } catch (e) {
        return null
      }
    },
    file () {
      return this.listFiles.find(({ tab }) => tab === this.tab)
    },
    compiledMarkdown () {
      try {
        const readme = get(this, 'loaded.readme', '')
        return marked(readme, {
          sanitize: true,
          gfm: true
        })
      } catch (e) {
        return null
      }
    },
    editorModel () {
      if (this.file.key === 'package') {
        try {
          return JSON.stringify(get(this, 'loaded.package', {}), null, 2)
        } catch (e) {
          return '{}'
        }
      }

      return get(this, `loaded.${this.file.key}`, '')
    }
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Integration', ['loadPublic', 'create']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.create(this.$route.params.id)
        this.$router.push('/app/i')
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
  async mounted () {
    try {
      await this.loadPublic(this.$route.params.id)
    } catch (e) {
      this.$router.push('/app/i')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/colors';

#integration-public
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

  .grid-layout
    display grid
    position absolute
    top 48px; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      .display-1
        background $vb-gutter

  .markdown
    padding 16px

  .monaco
    position absolute
    top 0; right 0; left 0; bottom 0;
    overflow hidden

    > div
      height 100%
</style>
