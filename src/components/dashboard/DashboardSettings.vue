<template lang="pug">
#dashboard-settings
  .pa-3
    v-flex(xs12)
      v-text-field(
        v-model="label"
        label="Dashboard Name"
        hide-details
        outlined
      )
    v-flex.mt-3(xs12)
      v-expansion-panels.elevation-1
        v-expansion-panel
          v-expansion-panel-header
            v-avatar.mr-3(
              :size="30"
              :color="bgc"
            )
            | Background Color
          v-expansion-panel-content
            color-picker(v-model="bgc")
    v-layout.mt-3(row xs12)
      v-flex
        .ma-0 Widget Border Radius
        v-slider.mt-0(
          @change="v => radius = v"
          :value="radius"
          :max="radiusMax"
          :min="radiusMin"
          :thumb-size="32"
          track-color="grey darken-2"
          thumb-label
          hide-details
        )
      v-flex(
        shrink
        style="max-width:60px"
      )
        v-text-field.mt-0.ml-3(
          v-model="radius"
          type="number"
          style="padding-top:8px"
          hide-details
          single-line
        )
    v-layout.mt-3(row xs12)
      v-flex
        .ma-0 Widget Shadow Opacity
        v-slider.mt-0(
          @change="v => shadow = v"
          :value="shadow"
          :max="100"
          :min="0"
          :thumb-size="32"
          track-color="grey darken-2"
          thumb-label
          hide-details
        )
      v-flex(
        shrink
        style="max-width:60px"
      )
        v-text-field.mt-0.ml-3(
          v-model="shadow"
          type="number"
          style="padding-top:8px"
          hide-details
          single-line
        )
    v-layout.mt-3(row xs12)
      v-flex
        .ma-0 Widget Shadow Radius
        v-slider.mt-0(
          @change="v => shadowRadius = v"
          :value="shadowRadius"
          :max="shadowRadiusMax"
          :min="shadowRadiusMin"
          :thumb-size="32"
          track-color="grey darken-2"
          thumb-label
          hide-details
        )
      v-flex(
        shrink
        style="max-width:60px"
      )
        v-text-field.mt-0.ml-3(
          v-model="shadowRadius"
          type="number"
          style="padding-top:8px"
          hide-details
          single-line
        )
    v-layout.mt-3(column xs12)
      v-layout(row)
        v-flex
          v-switch.ma-1(
            v-model="isPublic"
            label="Public"
            color="primary"
            hide-details
          )
        v-flex(
          v-if="isPublic"
          align-self-end
          shrink
        )
          tooltip(text="Open Public Dashboard" :open-delay="800" bottom)
            v-btn(
              :href="publicUrl"
              target="_blank"
              icon
            )
              v-icon mdi-launch
      v-flex.mt-2
        .body-2.grey--text
          | This option will make your dashboard publicly available.
          | Integration configurations <b class="white--text">will be hidden</b>. Widget configurations <b class="white--text">will not be hidden</b>.
          | Only enable this option if you are okay with that.
</template>

<script>
import debounce from 'lodash-es/debounce'
import { Chrome } from 'vue-color'
import { mapState, mapMutations } from 'vuex'
import { Tooltip } from '@/components'

export default {
  name: 'DashboardSettings',
  components: {
    'color-picker': Chrome,
    Tooltip
  },
  data: () => ({
    colors: '#FFF',
    radiusMin: 0,
    radiusMax: 50,
    radiusDefault: 5,
    shadowDefault: 3,
    shadowRadiusMin: 0,
    shadowRadiusMax: 25,
    shadowRadiusDefault: 5
  }),
  computed: {
    ...mapState('Dashboard', ['loaded']),
    publicUrl () {
      return `/public/${this.loaded.id}`
    },
    label: {
      get () { return this.loaded.label },
      set (label) { this.DASHBOARD_CONCAT_LOADED({ label }) }
    },
    isPublic: {
      get () { return !!this.loaded.public },
      set (isPublic) { this.DASHBOARD_CONCAT_LOADED({ public: isPublic }) }
    },
    bgc: {
      get () {
        const { r, g, b, a } = this.loaded.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: debounce(function (val) {
        const { rgba } = val
        this.DASHBOARD_CONCAT_LOADED({ settings: { rgba } })
      }, 20)
    },
    radius: {
      get () {
        const { radius } = this.loaded.settings
        return typeof radius === 'undefined'
          ? this.radiusDefault
          : radius
      },
      set (radius) {
        try {
          radius = parseInt(radius, 10)
          if (!isNaN(radius) && radius >= this.radiusMin && radius <= this.radiusMax)
            this.DASHBOARD_CONCAT_LOADED({ settings: { radius } })
        } catch (e) {
          console.log('Could not change slider value, ', e)
        }
      }
    },
    shadow: {
      get () {
        const { shadow } = this.loaded.settings
        return typeof radius === 'undefined'
          ? this.shadowDefault
          : shadow
      },
      set (shadow) {
        try {
          shadow = parseInt(shadow, 10)
          if (!isNaN(shadow) && shadow >= 0 && shadow <= 100)
            this.DASHBOARD_CONCAT_LOADED({ settings: { shadow } })
        } catch (e) {
          console.log('Could not change slider value, ', e)
        }
      }
    },
    shadowRadius: {
      get () {
        const { shadowRadius } = this.loaded.settings
        return typeof shadowRadius === 'undefined'
          ? this.shadowRadiusDefault
          : shadowRadius
      },
      set (shadowRadius) {
        try {
          shadowRadius = parseInt(shadowRadius, 10)
          if (!isNaN(shadowRadius) && shadowRadius >= this.shadowRadiusMin && this.shadowRadiusMax <= 100)
            this.DASHBOARD_CONCAT_LOADED({ settings: { shadowRadius } })
        } catch (e) {
          console.log('Could not change slider value, ', e)
        }
      }
    }
  },
  methods: mapMutations('Dashboard', ['DASHBOARD_CONCAT_LOADED'])
}
</script>

<style lang="stylus" scoped>
#dashboard-settings
  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px
</style>
