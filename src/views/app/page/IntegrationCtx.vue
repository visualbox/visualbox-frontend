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
      v-flex(xs10)
        v-switch(
          v-model="public"
          label="Public"
          color="primary"
          hide-details
        )
      v-flex(xs12)
        .text-xs-right(v-if="tab !== 0")
          v-btn.mr-0(
            flat icon
            @click="showInfo = !showInfo"
          )
            v-icon {{ showInfo ? 'close' : 'help' }}
        //- README
        v-alert(
          v-if="tab === 1"
          :value="showInfo"
          color="success"
        )
          p An integration should explain what it does, how it's configured and what the output looks like.
          p.mb-0 You can use standard <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_new">markdown</a> syntax here.

        //- Source
        v-alert(
          v-if="tab === 2"
          :value="showInfo"
          color="success"
        )
          .title.mb-3 CONFIG
          p <strong>CONFIG</strong> is a constant variable you can use within your integration to access user configurations. Each property is its <strong>name</strong> counterpart of the integration configuration.
          .title.mb-3 postMessage()
          p.mb-0 Use the <strong>postMessage()</strong> function to send data back to VisualBox from your integration.

        //- Config
        v-alert(
          v-if="tab === 3"
          :value="showInfo"
          color="success"
        )
          p The integration configuration is a <strong>JSON</strong> array containing configuration objects.
          p Object configuration:
          pre
            | [
            |   {
            |     "type": String (required),
            |     "name": String (required),
            |     "label": String (required),
            |     "default": String
            |   },
            |   { ... }
            | ]
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'IntegrationCtx',
  components: { AppContextToolbar },
  data: () => ({
    showInfo: false
  }),
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

  >>> .v-alert > div
    width 100%
    overflow hidden

    pre
      font-size 10px
</style>
