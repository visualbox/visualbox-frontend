import * as t from '@/store/types'

const state = {
  isReady: false,
  snackbar: {}
}

const mutations = {
  [t.APP_SET_IS_READY] (state, payload) {
    state.isReady = payload
  },
  [t.APP_SET_SNACKBAR] (state, payload) {
    state.snackbar = payload
  }
}

const actions = {
  setIsReady ({ commit }, payload) {
    commit(t.APP_SET_IS_READY, payload)
  },
  setSnackbar ({ commit }, payload) {
    commit(t.APP_SET_SNACKBAR, payload)
  }
}

const getters = {
  isReady (state) {
    return state.isReady
  },
  snackbar (state) {
    return state.snackbar
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
