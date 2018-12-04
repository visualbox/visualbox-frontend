<template lang="pug">
#widget-ctx(v-if="loaded")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.push('/app/w')"
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
        .text-xs-right(v-if="tab !== 0")
          v-btn.mr-0(
            flat icon
            @click="showInfo = !showInfo"
          )
            v-icon {{ showInfo ? 'mdi-close' : 'mdi-help-circle' }}
        //- README
        v-alert(
          v-if="tab === 1"
          :value="showInfo"
          color="success"
        )
          p A widget should explain what it does, how it's configured and what the output looks like.
          p.mb-0 You can use standard Markdown syntax here.

        //- Source
        v-alert(
          v-if="tab === 2"
          :value="showInfo"
          color="success"
        )
          .title.mb-3 Variables
          p <strong>CONFIG</strong> is a constant variable you can use within your widget to access user configurations. Each property is its <strong>name</strong> counterpart of the widget configuration.

          p The <strong>DATA</strong> variable is pointing to the selected data source from an integration output.

          .title.mb-3 Functions
          p.mb-0 The <strong>onMessage(event)</strong> function is called whenever updated data is provided to the widget.
          p The <strong>event</strong> argument takes the following form:
          pre
            | {
            |   type: 'CONFIG_CHANGED'|'DATA_CHANGED',
            |   value: &lt;new data&gt;
            | }
          p.mb-0.mt-3 Whenever <strong>onMessage()</strong> is called, <strong>CONFIG</strong> and <strong>DATA</strong> are automatically updated.

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
          p.mb-0.mt-3 You can find a list of valid configuration types in the Help Center.
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'WidgetCtx',
  components: { AppContextToolbar },
  data: () => ({
    showInfo: false
  }),
  methods: {
    ...mapActions('Widget', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar'])
  },
  computed: {
    ...mapState('Widget', ['tab']),
    ...mapGetters('Widget', ['loaded']),
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
#widget-ctx
  height 100%
  overflow auto

  >>> .v-alert > div
    width 100%
    overflow hidden

    pre
      font-size 10px
</style>
