// Used by dialogs for two-way data binding (dialog open state)
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    showDialog: false
  }),
  watch: {
    show (val) {
      this.showDialog = val
    },
    showDialog (val) {
      if (val === false)
        this.$emit('update:show', false)
    }
  }
}
