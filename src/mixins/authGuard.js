export default {
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters['Cognito/isLoggedIn'])
        vm.$router.push('/app/d')
    })
  }
}
