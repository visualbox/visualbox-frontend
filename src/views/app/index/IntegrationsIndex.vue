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
      .display-3.mb-4 Integrations
      .subheading Integrations are the engines behind your dashboard.
      .subheading They fetch, process and format data to be displayed by widgets.
      .subheading You can create your own integration, or search for already existing integrations.
      .subheading Existing integrations can be modified to your own needs.
      v-icon.index-icon mdi-lan
</template>

<script>
export default {
  name: 'IntegrationsIndex'
}
</script>

<style lang="stylus" scoped>
.container
  .flex
    position relative
</style>
