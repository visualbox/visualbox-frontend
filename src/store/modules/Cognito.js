import Auth from '@aws-amplify/auth'

const state = {
  session: {},
  user: {}
}

const mutations = {
  setSession (state, payload) {
    state.session = payload
  },
  setUser (state, payload) {
    state.user = payload
  }
}

const actions = {
  async fetchSession ({ commit }) {
    try {
      const session = await Auth.currentSession()
      const user = await Auth.currentUserPoolUser()
      commit('setSession', session)
      commit('setUser', user)
      return session
    } catch (e) {
      throw e
    }
  },

  async signInUser ({ commit }, { username, password }) {
    try {
      const user = await Auth.signIn(username, password)
      commit('setUser', user)
      commit('setSession', user.signInUserSession)

      if (localStorage)
        localStorage.setItem('USER', JSON.stringify(user))

      return user
    } catch (e) {
      throw e
    }
  },

  async registerUser ({ commit }, { username, password, attributes }) {
    try {
      // TODO: Ensure I'm attribute agnostic
      const user = await Auth.signUp({
        username,
        password,
        attributes
      })
      commit('setUser', user)
      commit('setSession', user.signInUserSession)

      if (localStorage)
        localStorage.setItem('USER', user)

      return user
    } catch (e) {
      throw e
    }
  },

  async confirmUser (_, { username, code }) {
    try {
      return await Auth.confirmSignUp(username, code)
    } catch (e) {
      throw e
    }
  },

  async resendConfirmation (_, { username }) {
    try {
      return await Auth.resendSignUp(username)
    } catch (e) {
      throw e
    }
  },

  async forgotPassword (_, { username }) {
    try {
      return await Auth.forgotPassword(username)
    } catch (e) {
      throw e
    }
  },

  async changePassword (_, { username, code, newPassword }) {
    try {
      return await Auth.forgotPasswordSubmit(
        username,
        code,
        newPassword
      )
    } catch (e) {
      throw e
    }
  },

  async signOut ({ commit, getters }) {
    try {
      const { isLoggedIn } = getters
      if (!isLoggedIn)
        throw new Error('User not logged in.')

      const result = await Auth.signOut()
      commit('setUser', {})
      commit('setSession', {})

      if (localStorage)
        localStorage.removeItem('USER')

      return result
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  // TODO: ensure best method to verify this
  isLoggedIn: (store = {}) => {
    return Boolean(
      store.session &&
      store.session.accessToken &&
      store.session.accessToken.jwtToken
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
