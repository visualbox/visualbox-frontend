import ONLINE_DRIVER from './ONLINE_DRIVER'
import OFFLINE_DRIVER from './OFFLINE_DRIVER'

class API {
  attachStore (store) {
    this.store = store
  }

  isLoggedIn () {
    return this.store.getters['Cognito/isLoggedIn']
  }

  async invoke (method, path, opts) {
    console.log('INVOKING', this.isLoggedIn())
    try {
      return this.isLoggedIn()
        ? await ONLINE_DRIVER(method, path, opts)
        : await OFFLINE_DRIVER(method, path, opts)
    } catch (e) {
      throw e
    }
  }
}

export default new API()
