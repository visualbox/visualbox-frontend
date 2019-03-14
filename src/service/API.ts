import { Store } from 'vuex'
import API_AWS from './API_AWS'

class API {
  private store: Store<any> | null = null

  public attachStore (store: Store<any>): void {
    this.store = store
  }

  public async invoke (method: string, path: string, opts?: IObject) {
    try {
      if (this.isLoggedIn())
        return await API_AWS(method, path, opts)
      else
        throw new Error('Not authenticated')
    } catch (e) {
      throw e
    }
  }

  private isLoggedIn (): boolean {
    return (this.store) ? this.store.getters['Cognito/isLoggedIn'] : false
  }
}

export default new API()
