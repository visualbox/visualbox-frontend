<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center)
    v-flex(
      xs12
      sm12
      md10
      lg8
      xl6
      offset-xs0
      offset-sm0
      offset-md1
      offset-lg2
      offset-xl3
    )
      .display-3.mb-4 Widgets!
      .subheading Widgets are the building blocks of your dashboard.
      .subheading They are self-contained components that are fed data from integrations.
      .subheading You can create your own widgets, or search for already existing widgets.
      .subheading Existing widgets can be modified to your own needs.
      v-icon.index-icon mdi-hexagon-multiple
</template>

<script>
export default {
  name: 'WidgetsIndex'
}
</script>

<style lang="stylus" scoped>
.container
  .flex
    position relative
</style>
