<template lang="pug">
v-container#dashboard(
  fluid
  v-if="loaded !== null && typeof loaded !== 'undefined'"
)
  v-layout(
    align-center
    justify-center
    row
    fill-height
  )
    mr-container.elevation-5(
      :style="style"
      @drop="dropHandler"
    )
      span foo
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MrContainer from '@/components/app/MrContainer'

export default {
  name: 'Dashboard',
  components: { MrContainer },
  computed: {
    ...mapGetters('Dashboard', ['loaded']),
    style () {
      const { width, height } = this.loaded.settings
      const { r, g, b, a } = this.loaded.settings.rgba
      const bgc = `rgba(${r}, ${g}, ${b}, ${a})`

      return {
        'background-color': bgc,
        'width': width,
        'height': height
      }
    }
  },
  methods: {
    ...mapActions('Dashboard', ['load']),
    dropHandler (e) {
      const appContainer = document.getElementById('app')
      let element = JSON.parse(e.dataTransfer.getData('text/plain'))

      let top = e.pageY + appContainer.scrollTop - appContainer.offsetTop - this.$el.offsetTop - (50 / 2)
      let left = e.pageX + appContainer.scrollLeft - appContainer.offsetLeft - this.$el.offsetLeft - (50 / 2)
      console.log(top, left)

      // const fixedElement = fixElementToParentBounds({top, left, height, width}, this.page)
      // element = {...element, ...fixedElement}
      // this.registerElement({pageId: this.page.id, el: element, global: e.shiftKey})
    }
  },
  mounted () {
    this.load(this.$route.params.id)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  height 100%

  #mr-container
    height 100%
    background #FFF
</style>
