import { BuildWorker } from '@/service'

class WorkerHandler {
  attachStore (store) {
    this.store = store
    this.workers = {}
  }

  /**
   * Convenience store mappers.
   */
  get integrationById () {
    return this.store.getters['Integration/integrationById']
  }

  get bundleById () {
    return this.store.getters['Bundler/bundleById']
  }

  get setData () {
    return this.store.mutations['Data/DATA_SET_DATA']
  }

  get cleanData () {
    return this.store.mutations['Data/DATA_CLEAN_DATA']
  }

  /**
   * Register integrations by first trying
   * to fetch them from source, and then starting
   * them with configurations from integration.
   * If not found, bundle and repeat.
   */
  register (integrations) {
    integrations.forEach(integration => {
      try {
        // Get dashboard ID, user config and Integration ID
        const { i, settings: { config } } = integration
        const { id } = this.integrationById(integration.id)

        // Get bundle by Integration ID from cache
        this.bundleById(id)
          .then(bundle => {
            // Cache miss
            if (!bundle) {
              console.log('Integration not found, need to bundle')

            // Cache hit
            } else {
              this.workers[i] = BuildWorker(bundle, config)
              this.workers[i].onmessage = ({ data }) => {
                this.setData({ i, data })
              }
            }
          })

      } catch (e) {
        console.log(`Failed to start an integration`)
      }
    })
  }

  /**
   * End a worker by dashboard ID.
   * If supplied dashboard ID is null,
   * end all registered workers.
   */
  end (i = null) {
    if (i === null) {
      const workers = Object.values(this.workers)
      const dIDs = Object.keys(this.workers)

      workers.forEach(w => w.terminate())
      this.cleanData(dIDs)
      this.workers = {}

    // End single
    } else {
      if (!this.workers.hasOwnProperty(i))
        return

      try {
        this.workers[i].terminate()
        this.cleanData([ i ])
        delete this.workers[i]
      } catch (e) {}
    }
  }
}

export default new WorkerHandler()
