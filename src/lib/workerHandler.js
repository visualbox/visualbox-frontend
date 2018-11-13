
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
    integrations.forEach(i => {
      // Get ID, source code and config vars from integration
      const { id, source } = this.integrationById(i.id)
      const { config } = i.settings

      // Create injectable JS code containing config vars
      const injected = `const CONFIG = ${JSON.stringify(config)};`

      // Create worker BLOB with injected config vars
      const workerBlob = URL.createObjectURL(new Blob([injected + source], { type: 'application/javascript' }))

      // Create worker and hook onmessage callback
      const worker = new Worker(workerBlob)
      worker.onmessage = e => {
        // Vuex mutation
        this.DATA_SET_DATA({
          id,
          data: e.data
        })
      }

      // Push worker to worker list
      this.workers.push({
        id,
        worker: new Worker(workerBlob)
      })
    })
  }

  end () {
    this.workers.forEach(w => w.worker.terminate())
    this.DATA_CLEAN_DATA(this.workers.map(w => w.id))
    this.workers = []
  }
}

export default new WorkerHandler()
