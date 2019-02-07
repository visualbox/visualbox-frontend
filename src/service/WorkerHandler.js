import { BuildWorker } from '@/service'
import EventBus from '@/lib/eventBus'

class WorkerHandler {
  constructor () {
    this.data = {}
  }

  attachStore (store) {
    this.store = store
    this.workers = {}
  }

  /**
   * Convenience store mappers.
   */
  integrationById (id) {
    return this.store.getters['Integration/integrationById'](id)
  }

  bundleById (id) {
    return this.store.getters['Bundler/bundleById'](id)
  }

  queueBundle (payload) {
    return this.store.dispatch('Bundler/queueBundle', payload)
  }

  setData (i, data) {
    this.data[i] = data
    EventBus.$emit('vbox:dataChanged:layout', { i, data })
    EventBus.$emit('vbox:dataChanged:config')
  }

  cleanData (is) {
    is.forEach(i => {
      delete this.data[i]
    })
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
        const { i, id, settings: { config } } = integration
        // const { id } = this.integrationById(integration.id)

        // Get bundle by Integration ID from cache
        this.bundleById(id)
          .then(bundle => {
            // Cache miss
            if (!bundle) {
              console.log('cache miss')
              const project = this.integrationById(id)
              this.queueBundle({
                project,
                cb: (err, code) => {
                  if (err) {
                    console.log(`Failed to start an integration`, err)
                    return
                  }
                  this.workers[i] = BuildWorker(code, config)
                  this.workers[i].onmessage = ({ data }) => {
                    this.setData(i, data)
                  }
                }
              })

            // Cache hit
            } else {
              console.log('cache hit')
              this.workers[i] = BuildWorker(bundle, config)
              this.workers[i].onmessage = ({ data }) => {
                this.setData(i, data)
              }
            }
          })

      } catch (e) {
        console.log(`Failed to start an integration`, e)
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
