
class WorkerHandler {
  constructor () {
    this.integrationById = null
    this.integrations = null
    this.workers = []
  }

  init (integrationById) {
    this.integrationById = integrationById
  }

  register (integrations) {
    integrations.forEach(i => {
      const { id, source } = this.integrationById(i.id)
      const { config } = i.settings
      const injected = `const CONFIG = ${JSON.stringify(config)};`
      const workerBlob = URL.createObjectURL(new Blob([injected + source], { type: 'application/javascript' }))
      const worker = new Worker(workerBlob)
      worker.onmessage = e => {
        console.log(id, 'Worker got msg', e.data)
      }
      this.workers.push({
        id,
        worker: new Worker(workerBlob)
      })
    })
  }

  end () {
    this.workers.forEach(w => w.worker.terminate())
    this.workers = []
    // TODO: cleanup vuex module data produced by workers
  }
}

export default new WorkerHandler()
