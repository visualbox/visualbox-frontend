<template lang="pug">
#dashboard-settings
  v-container.pa-3(grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        v-text-field(
          v-model="label"
          label="Label"
          hide-details
          outline
        )
      v-flex(xs6)
        v-text-field.mb-3(
          v-model="width"
          label="Width"
          hide-details
          outline
        )
      v-flex(xs6)
        v-text-field.mb-3(
          v-model="height"
          label="Height"
          hide-details
          outline
        )
      v-flex(xs12)
        v-expansion-panel
          v-expansion-panel-content
            div(slot="header")
              v-avatar.mr-3(
                :size="30"
                :color="bgc"
              )
              | Background Color
            color-picker(
              v-model="bgc"
            )
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DashboardSettings',
  components: {
    'color-picker': Chrome
  },
  data: () => ({
    colors: '#FFF'
  }),
  computed: {
    ...mapGetters('Dashboard', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set: _.debounce(function (label) {
        this.updateLoaded({ label })
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    width: {
      get () {
        return this.loaded.settings.width
      },
      set: _.debounce(function (width) {
        this.updateLoaded({ settings: { width } })
      }, 20)
    },
    height: {
      get () {
        return this.loaded.settings.height
      },
      set: _.debounce(function (height) {
        this.updateLoaded({ settings: { height } })
      }, 20)
    },
    bgc: {
      get () {
        const { r, g, b, a } = this.loaded.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: _.debounce(function (val) {
        const { rgba } = val
        this.updateLoaded({ settings: { rgba } })
      }, 20)
    }
  },
  methods: mapActions('Dashboard', ['updateLoaded'])
}
</script>

<style lang="stylus" scoped>
#dashboard-settings
  >>> .vc-chrome
    width unset
    font-family inherit

    .vc-chrome-body
      background-color #424242

      .vc-checkerboard
        background-repeat repeat

      .vc-chrome-fields
        .vc-input__input, .vc-input__label
          color #FFF !important

      .vc-chrome-toggle-icon
        path
          fill #FFF

      .vc-chrome-toggle-icon-highlight
        background #272727
</style>
