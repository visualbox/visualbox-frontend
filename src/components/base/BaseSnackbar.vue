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
  v-icon(
    :dark="snackbar.type !== 'warning'"
    v-text="icon"
  )
</template>

<script>
import mapApp from '@/mixins/mapApp'

const ICON_MAP = {
  error: 'error',
  info: 'info',
  success: 'check_circle',
  warning: 'warning'
}

export default {
  name: 'BaseSnackbar',
  mixins: [ mapApp ],
  data: () => ({
    model: false,
    message: null
  }),
  computed: {
    icon () {
      return ICON_MAP[this.snackbar.type] || 'check'
    }
  },
  watch: {
    snackbar () {
      this.model = true
    }
  }
}
</script>
