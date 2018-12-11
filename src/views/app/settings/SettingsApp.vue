<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)

    .headline.mb-3 Theme
    v-switch(
      v-model="theme"
      label="Light"
      color="primary"
    )
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SettingsApp',
  data: () => ({
    theme: false
  }),
  computed: mapState('Cognito', ['user']),
  methods: {
    ...mapActions('App', ['setSnackbar'])
  }
}
</script>

<style lang="stylus" scoped>
</style>
