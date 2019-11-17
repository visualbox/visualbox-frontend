<template lang="pug">
#dashboard-settings
  .pa-3
    v-text-field.mb-4(
      v-model="label"
      label="Dashboard Name"
      hide-details
      outlined
    )
    v-dialog(
      v-model="dialog"
      width="450"
    )
      template(#activator="{ on }")
        v-expansion-panels.elevation-1
          v-expansion-panel(v-on="on")
            v-expansion-panel-header(
              expand-icon=""
              style="min-height: unset;"
            )
              v-icon.ml-1.mr-3.my-1 mdi-share-variant
              | Share Dashboard
      base-card
        v-card-text.px-6.pt-6.pb-3
          .text-center.headline.mb-4 Share Dashboard
          v-switch.ma-0(
            v-model="isPublic"
            label="Make Dashboard Public"
            color="primary"
            hide-details
          )
          .body-2.grey--text.mt-4
            | The following conditions apply:<br>
            ul.my-2
              li Integration configurations <b class="white--text">will be hidden</b>.
              li Widget configurations <b class="white--text">will not be hidden</b>.
            | Only make your dashboard public if you are okay with this.
          .mt-3(v-if="isPublic")
            v-text-field(
              v-model="publicURL"
              @click:append="openPublicURL"
              @click="$event.target.select()"
              prefix="Public URL:"
              append-icon="mdi-launch"
              hide-details outlined
              readonly
            )
            v-switch.mt-4(
              v-model="isIndexed"
              label="Appear in VisualBox Dashboard Explorer"
              color="primary"
              hide-details
            )
        v-card-actions.pb-4.pr-4
          v-spacer
          v-btn.ma-0.px-3(
            @click="dialog = false"
            color="primary"
            large outlined
          ) Close

    v-expansion-panels.mt-4.elevation-1
      v-expansion-panel
        v-expansion-panel-header
          v-avatar.mr-3(
            :size="26"
            :color="bgc"
          )
          | Background Color
        v-expansion-panel-content
          color-picker(v-model="bgc")

    v-layout.mt-4(row xs12)
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
    v-layout.mt-4(row xs12)
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
    v-layout.mt-4(row xs12)
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
</template>

<script>
import debounce from 'lodash-es/debounce'
import { Chrome } from 'vue-color'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Tooltip } from '@/components'
import { BaseCard } from '@/components/base'

export default {
  name: 'DashboardSettings',
  components: {
    'color-picker': Chrome,
    Tooltip,
    BaseCard
  },
  data: () => ({
    colors: '#FFF',
    dialog: false,
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
    publicURL () {
      return `${window.location.origin}/public/${this.loaded.id}`
    },
    label: {
      get () { return this.loaded.label },
      set (label) { this.DASHBOARD_CONCAT_LOADED({ label }) }
    },
    isPublic: {
      get () { return !!this.loaded.public },
      set (isPublic) {
        this.DASHBOARD_CONCAT_LOADED({ public: isPublic })

        /**
         * 'isIndexed' cannot be 'true' if 'isPublic'
         * is 'false'.
         */
        if (!isPublic && this.isIndexed === true)
          this.DASHBOARD_CONCAT_LOADED({ indexed: false })

        /**
         * Immediately commit dashboard changes when public
         * is changed so that if the public dashboard is
         * accessible immediately (and not "only" after the
         * automatically scheduled commit happens).
         */
        this.commit()
      }
    },
    isIndexed: {
      get () { return !!this.loaded.indexed },
      set (isIndexed) {
        this.DASHBOARD_CONCAT_LOADED({ indexed: isIndexed })
        this.commit()
      }
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
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_CONCAT_LOADED']),
    ...mapActions('Dashboard', ['commit']),
    openPublicURL () {
      window.open(this.publicURL, '_blank')
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-settings
  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px
</style>
