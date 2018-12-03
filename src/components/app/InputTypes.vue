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
    //- Switch type
    v-switch(
      v-if="field.type === 'switch'"
      v-model="internalValue[field.name]"
      :label="field.label"
      :type="field.type"
      color="primary"
      hide-details
    )
    //- Slider type
    v-slider(
      v-if="field.type === 'slider'"
      v-model="internalValue[field.name]"
      :hint="field.label"
      :max="field.max"
      :min="field.min"
      :thumb-size="24"
      thumb-label
      persistent-hint
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
import * as _ from 'lodash'
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'InputTypes',
  mixins: [ ProxyValue ],
  props: {
    config: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
