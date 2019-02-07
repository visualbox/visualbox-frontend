<template lang="pug">
v-tooltip(
  :open-delay="openDelay"
  :close-delay="0"
  :color="color"
  :bottom="bottom"
  :right="right"
  :left="left"
  :top="top"
  transition="fade-transition"
)
  span {{ text }}
  template(slot="activator")
    slot
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Tooltip',
  props: {
    color: {
      type: String,
      default: 'black'
    },
    text: {
      type: String,
      default: ''
    },
    openDelay: {
      type: Number,
      default: 0
    },
    bottom: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    top: {
      type: Boolean,
      default: false
    }
  }
})
</script>
