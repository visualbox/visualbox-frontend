<template lang="pug">
v-snackbar(
  v-model="model"
  :color="snackbar.type"
  :timeout="snackbar.timeout"
  right
)
  span(
    :class="snackbar.type === 'warning' ? 'black--text' : 'white--text'"
    v-text="snackbar.msg"
  )
  v-icon.ml-2(
    :dark="snackbar.type !== 'warning'"
    v-text="icon"
  )
</template>

<script>
import { mapGetters } from 'vuex'

const ICON_MAP = {
  error: 'mdi-alert',
  info: 'mdi-information',
  success: 'mdi-check',
  warning: 'mdi-alert'
}

export default {
  name: 'BaseSnackbar',
  data: () => ({
    model: false,
    message: null
  }),
  computed: {
    ...mapGetters('App', ['snackbar']),
    icon () {
      return ICON_MAP[this.snackbar.type] || 'mdi-check'
    }
  },
  watch: {
    snackbar () {
      this.model = true
    }
  }
}
</script>
