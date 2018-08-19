import Vue from 'vue'

const eventBus = new Vue()

Vue.mixin({
  data: () => ({
    eventBus
  }),
  methods: {
    handleError (e) {
      const { message } = e
      this.eventBus.$emit('ui:snackbar', { message })
    }
  }
})
