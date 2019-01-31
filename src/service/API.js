class API {
  attachStore (store) {
    this.store = store
  }

  isLoggedIn () {
    return this.attachStore.store.getters['Cognito/isLoggedIn']
  }
}

export default new API()
