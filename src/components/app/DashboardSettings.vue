<template lang="pug">
#dashboard-settings
  v-container.pa-3(grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        v-expansion-panel
          v-expansion-panel-content
            div(slot="header")
              v-avatar.mr-3(
                :size="30"
                :color="bgc"
              )
              | Background Color
            color-picker(v-model="bgc")
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
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DashboardSettings',
  components: {
    'color-picker': Chrome
  },
  data: () => ({
    colors: '#FFF'
  }),
  computed: {
    ...mapState('Dashboard', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    width: {
      get () {
        return this.loaded.settings.width
      },
      set (width) {
        this.updateLoaded({ settings: { width } })
      }
    },
    height: {
      get () {
        return this.loaded.settings.height
      },
      set (height) {
        this.updateLoaded({ settings: { height } })
      }
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
  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px
</style>
