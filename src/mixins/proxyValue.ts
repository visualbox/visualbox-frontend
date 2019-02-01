import Vue from 'vue'

export default Vue.extend({
  props: ['value'],
  computed: {
    internalValue: {
      get (): any {
        return this.value
      },
      set (val: any) {
        this.$emit('input', val)
      }
    }
  }
})
