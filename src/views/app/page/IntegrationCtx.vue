<template lang="pug">
#integration-ctx(v-if="loaded")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-container.pa-3(grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        v-text-field(
          v-model="label"
          label="Label"
          hide-details
          outline
        )
      v-flex(xs12)
        v-switch(
          v-model="public"
          label="Public"
          color="primary"
          hide-details
        )
      v-flex(xs12)
        //- README
        v-alert(
          v-if="tab === 1"
          :value="true"
          color="warning"
          outline
        )
          .title.mb-3 Markdown
          p An integration should explain <strong>what it does</strong>, <strong>how it's configured</strong> and <strong>what the output looks like</strong>.<br>
          p.mb-0 You can use standard <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_new">markdown</a> syntax here.

        //- Source
        v-alert(
          v-if="tab === 2"
          :value="true"
          color="warning"
          outline
        )
          .title.mb-3 JavaScript
          p <strong>CONFIG</strong> is a constant variable you can use within your integration to access user configurations. Each property is its <strong>name</strong> counterpart of the integration configuration.
          p.mb-0 Use the method <strong>postMessage()</strong> to send data back to VisualBox from your integration.

        //- Config
        v-alert(
          v-if="tab === 3"
          :value="true"
          color="warning"
          outline
        )
          .title.mb-3 JSON
          p The integration coniguration is a <strong>JSON</strong> array containing configuration objects.
          p Object configuration:
          pre
            | {
            |   "type": String (required),
            |   "name": String (required),
            |   "label": String (required),
            |   "default": String
            | }
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'IntegrationCtx',
  components: { AppContextToolbar },
  methods: {
    ...mapActions('Integration', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar'])
  },
  computed: {
    ...mapState('Integration', ['tab']),
    ...mapGetters('Integration', ['loaded']),
    label: {
      get () {
        return _.get(this, 'loaded.label', '')
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    public: {
      get () {
        return _.get(this, 'loaded.public', false)
      },
      set (isPublic) {
        this.updateLoaded({ public: isPublic })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
#integration-ctx
  height 100%
  overflow auto
</style>
