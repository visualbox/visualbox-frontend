import { Store } from 'vuex'
import ONLINE_DRIVER from './ONLINE_DRIVER'
import OFFLINE_DRIVER from './OFFLINE_DRIVER'

class API {
  private store: Store<any> | null = null

  public attachStore (store: Store<any>): void {
    this.store = store
  }

  public async invoke (method: string, path: string, opts?: IObject) {
    try {
      return this.isLoggedIn()
        ? await ONLINE_DRIVER(method, path, opts)
        : await OFFLINE_DRIVER(method, path, opts)
    } catch (e) {
      throw e
    }
  }

  private isLoggedIn (): boolean {
    return (this.store) ? this.store.getters['Cognito/isLoggedIn'] : false
  }
}

export default new API()
