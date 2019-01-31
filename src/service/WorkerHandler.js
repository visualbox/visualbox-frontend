import { BuildWorker } from '@/service'

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
      const { i, settings: { config } } = integration
      const { source } = this.integrationById(integration.id)
      // ^ fetch package to get deps for worker

      // Create worker and hook onmessage callback
      let worker = BuildWorker(source, config)
      worker.onmessage = ({ data }) => {
        this.DATA_SET_DATA({ i, data })
      }

      // Push worker to worker list
      this.workers.push({ i, worker })
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
