<template lang="pug">
v-btn(
  v-on="$listeners"
  v-bind="$attrs"
  :small="!prominent"
  color="primary"
  depressed
)
  slot
</template>

<script>
export default {
  name: 'BaseBtn',
  inheritAttrs: false,
  props: {
    prominent: Boolean
  }
}
</script>
