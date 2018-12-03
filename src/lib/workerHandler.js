
class WorkerHandler {
  constructor () {
    this.integrationById = null
    this.DATA_SET_DATA = null // Vuex mutation
    this.DATA_CLEAN_DATA = null // Vuex mutation
    this.integrations = null
    this.workers = []
  }

  init (integrationById, DATA_SET_DATA, DATA_CLEAN_DATA) {
    this.integrationById = integrationById
    this.DATA_SET_DATA = DATA_SET_DATA
    this.DATA_CLEAN_DATA = DATA_CLEAN_DATA
  }

  register (integrations) {
    integrations.forEach(integration => {
      // Get ID, source code and config vars from integration
      const { id, i, settings } = integration
      const { config } = settings
      const { source } = this.integrationById(integration.id)

      // Create injectable JS code containing config vars
      const injected = `const CONFIG = ${JSON.stringify(config)};`

      // Create worker BLOB with injected config vars
      const workerBlob = URL.createObjectURL(new Blob([injected + source], { type: 'application/javascript' }))

      // Create worker and hook onmessage callback
      const worker = new Worker(workerBlob)
      console.log('created worker', i)
      worker.onmessage = e => {
        // Vuex mutation
        console.log('GOT MSG', i, e.data)
        this.DATA_SET_DATA({
          i,
          data: e.data
        })
      }

      // Push worker to worker list
      this.workers.push({
        i,
        worker: new Worker(workerBlob)
      })
    })
  }

  end (i = null) {
    // End all
    if (i === null) {
      this.workers.forEach(w => w.worker.terminate())
      this.DATA_CLEAN_DATA(this.workers.reduce((a, b) => {
        a.push(b.i)
        return a
      }, []))
      this.workers = []

    // End single
    } else {
      const index = this.workers.findIndex(w => w.i === i)

      // Not found
      if (index < 0)
        return

      try {
        const worker = this.workers[index]
        worker.worker.terminate()
        this.DATA_CLEAN_DATA([ worker.i ])
        this.workers.splice(index, 1)
      } catch (e) {}
    }
  }
}

export default new WorkerHandler()
