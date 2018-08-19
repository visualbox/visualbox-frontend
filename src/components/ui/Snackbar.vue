<template lang="pug">
v-snackbar(
  :bottom="true"
  v-model="show"
)
  span {{ message }}
</template>

<script>
export default {
  name: 'UiSnackbar',
  data: () => ({
    message: null,
    show: false
  }),
  created () {
    this.eventBus.$on('ui:snackbar', ({ message }) => {
      this.message = message
      this.show = true
    })
  },
  beforeDestroy () {
    this.eventBus.$off('ui:snackbar')
  }
}
</script>
