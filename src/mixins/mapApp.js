import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters('App', [
    'isReady',
    'snackbar'
  ]),
  methods: mapActions('App', [
    'setIsReady',
    'setSnackbar'
  ])
}
