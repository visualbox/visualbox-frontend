<template lang="pug">
div
  .mb-4(
    v-for="(field, index) in config.variables"
    :key="index"
  )
    //- Text/password type
    v-text-field(
      v-if="field.type === 'text' || field.type === 'password'"
      v-model="internalValue[field.name]"
      :label="field.label"
      :type="field.type"
      hide-details
      outlined
    )
    //- Color type
    v-expansion-panels.mt-3.elevation-1(v-if="field.type === 'color'")
      v-expansion-panel
        v-expansion-panel-header
          v-avatar.mr-3(
            :size="26"
            :color="internalValue[field.name]"
          )
          | {{ field.label }}
        v-expansion-panel-content
          color-picker(
            :value="internalValue[field.name] || '#FFF'"
            @input="v => inputColor(field.name, v)"
          )
    //- Switch type
    v-switch(
      v-if="field.type === 'switch'"
      v-model="internalValue[field.name]"
      :label="field.label"
      color="primary"
      hide-details
    )
    //- Slider type
    //- :value="internalValue[field.name]"
    //- @change="v => internalValue[field.name] = v"
    //-
    //- v-model="internalValue[field.name]"
    v-layout(row v-if="field.type === 'slider'")
      v-flex
        .ma-0 {{ field.label }}
        v-slider.mt-0(
          @change="v => internalValue[field.name] = v"
          :value="internalValue[field.name]"
          :max="field.max"
          :min="field.min"
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
          @input="v => inputSlider(v, field)"
          :value="internalValue[field.name]"
          type="number"
          style="padding-top:8px"
          hide-details
          single-line
        )
    //- Select type
    v-select(
      v-if="field.type === 'select'"
      v-model="internalValue[field.name]"
      :items="field.options"
      :label="field.label"
      item-text="label"
      item-value="value"
      outlined hide-details
    )
    //- Date type
    v-menu(
      v-if="field.type === 'date'"
      :close-on-content-click="false"
      transition="scale-transition"
      min-width="290px"
      offset-y
    )
      template(#activator="{ on }")
        v-text-field(
          v-on="on"
          v-model="internalValue[field.name]"
          :label="field.label"
          append-icon="mdi-calendar"
          readonly hide-details
          outlined
        )
      v-date-picker(
        v-model="internalValue[field.name]"
        color="primary"
        no-title scrollable
      )
  //- Integration config parse errors
  v-alert(
    v-for="(item, index) in config.error"
    :key="index"
    :value="true"
    type="error"
    outlined
  ) {{ item }}
</template>

<script>
import debounce from 'lodash-es/debounce'
import { Chrome } from 'vue-color'
import { proxyValue } from '@/mixins'

export default {
  name: 'InputTypes',
  mixins: [ proxyValue ],
  components: { 'color-picker': Chrome },
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  methods: {
    inputColor: debounce(function (fieldName, { hex }) {
      this.internalValue[fieldName] = hex
    }, 20),
    inputSlider (val, field) {
      try {
        val = parseInt(val, 10)
        if (!isNaN(val) && val >= field.min && val <= field.max)
          this.internalValue[field.name] = val
      } catch (e) {
        console.log('Could not change slider value, ', e)
      }
    }
  }
}
</script>
