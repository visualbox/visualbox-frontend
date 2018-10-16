<template lang="pug">
#dashboard-ctx(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-tabs(
    color="rgba(0,0,0,0)"
    slider-color="primary"
    grow
  )
    v-tab
      v-icon device_hub
    v-tab
      v-icon widgets
    v-tab
      v-icon settings

    v-tab-item
      span Integrations
    v-tab-item
      v-container.pa-3(grid-list-lg)
        v-layout(row wrap)
          v-flex.elevation-3(
            xs4
            v-for="(item, index) in list"
            :key="index"
          )
            span {{ item.label }}
    v-tab-item
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
          v-flex(
            xs12
            @mouseover.native="isMouseOut = false"
            @mouseout.native="isMouseOut = true"
            @click.capture="isPickerOpen = !isPickerOpen"
          )
            v-avatar.mr-3(
              :size="30"
              :color="bgc"
            )
            | Background Color
            color-picker.mt-3(
              v-model="colors"
              @input="updateColor"
              v-if="isPickerOpen"
            )
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { Chrome } from 'vue-color'
import { mapActions, mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'DashboardCtx',
  components: {
    AppContextToolbar,
    'color-picker': Chrome
  },
  data: () => ({
    colors: '#FFF',
    isPickerOpen: false,
    isMouseOut: false
  }),
  computed: {
    ...mapGetters('Widget', ['list']),
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
    updatedAt () {
      const { updatedAt } = this.loaded
      return moment(updatedAt).format('DD/MM HH:mm:ss')
    },
    bgc () {
      const { r, g, b, a } = this.loaded.settings.rgba
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
  },
  watch: {
    isPickerOpen: function (val) {
      (val === true)
        ? document.documentElement.addEventListener('click', this.onDocumentClick, true)
        : document.documentElement.removeEventListener('click', this.onDocumentClick, true)
    }
  },
  methods: {
    ...mapActions('Dashboard', ['updateLoaded']),
    updateColor: _.debounce(function (val) {
      const { rgba } = val
      this.updateLoaded({ settings: { rgba } })
    }, 20),
    onDocumentClick () {
      if (this.isMouseOut)
        this.isPickerOpen = false
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-ctx
  .vc-chrome
    width unset
    font-family inherit
</style>
