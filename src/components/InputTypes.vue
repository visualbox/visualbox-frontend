<template lang="pug">
div
  .mb-3(
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
      outline
    )
    //- Color type
    v-expansion-panel.mt-3(v-if="field.type === 'color'")
      v-expansion-panel-content
        div(slot="header")
          v-avatar.mr-3(
            :size="30"
            :color="internalValue[field.name]"
          )
          | {{ field.label }}
        color-picker(
          :value="internalValue[field.name]"
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
    template(v-if="field.type === 'slider'")
      .ma-0 {{ field.label }}
      v-slider.mt-0(
        v-model="internalValue[field.name]"
        :label="String(internalValue[field.name])"
        :max="field.max"
        :min="field.min"
        :thumb-size="32"
        inverse-label
        thumb-label
        hide-details
      )
    //- Select type
    v-select(
      v-if="field.type === 'select'"
      v-model="internalValue[field.name]"
      :items="field.options"
      :label="field.label"
      item-text="label"
      item-value="value"
    )
    //- Date type
    v-menu(
      v-if="field.type === 'date'"
      :close-on-content-click="false"
      transition="scale-transition"
      lazy offset-y full-width
      min-width="290px"
    )
      v-text-field(
        slot="activator"
        v-model="internalValue[field.name]"
        :label="field.label"
        append-icon="mdi-calendar"
        readonly hide-details
        outline
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
    outline
  ) {{ item }}
</template>

<script>
import { Chrome } from 'vue-color'
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'InputTypes',
  mixins: [ ProxyValue ],
  components: { 'color-picker': Chrome },
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  methods: {
    inputColor (fieldName, { hex }) {
      this.internalValue[fieldName] = hex
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
