import Vue from 'vue'

export default Vue.extend({
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters['Cognito/isLoggedIn'])
        vm.$router.push('/app/d')
    })
  }
})
