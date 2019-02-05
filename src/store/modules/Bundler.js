import localforage from 'localforage'
import get from 'lodash-es/get'
import * as t from '@/store/types'
import BunderWorker from '@/service/worker/bundler.worker'
import { cloneDeep } from '@/lib/utils'

const CACHE = localforage.createInstance({
  name: 'bundle-cache'
})

const state = {
  bundler: new BunderWorker(),

  /**
   * Queue contains projects that are
   * waiting to be bundled. A queued
   * project can never be active or in progress.
   */
  queue: [],

  /**
   * Active holds the ID of a project
   * actively being bundled.
   */
  active: null,

  /**
   * Last status message from the bundler.
   */
  status: null
}

const mutations = {
  [t.BUNDLER_SET_ACTIVE] (state, payload) {
    state.active = payload
  },
  [t.BUNDLER_SET_STATUS] (state, payload) {
    state.status = payload
  },
  [t.BUNDLER_SET_QUEUE] (state, { project, cb }) {
    // if (state.active === id)
    // abort?

    /**
     * If queue already contains project ID,
     * we can regard queued item as old and
     * thus discard it.
     */
    const index = state.queue.findIndex(({ project: { id }}) => id === project.id)
    if (index >= 0) {
      state.queue[index].cb('[Bundler]: aborted', null)
      state.queue.splice(index, 1)
    }

    // Push new project to end of queue
    state.queue.push({ project, cb })
  },
  [t.BUNDLER_SHIFT] (state) {
    const next = state.queue.shift()
    if (!next)
      return

    state.active = next.project.id
  }
}

const actions = {
  /**
   * Entry action for a dispatcher wanting to
   * bundle a project.
   */
  queueBundle ({ commit, dispatch }, { project, cb }) {
    commit(t.BUNDLER_SET_QUEUE, { project, cb })
    dispatch('queueTryShift')
  },

  /**
   * Try to shift queue if not currently active.
   */
  queueTryShift ({ commit, state, dispatch }) {
    const { active, queue, } = state

    if (active || queue.length <= 0)
      return

    // --- STAGE: READY
    commit(t.BUNDLER_SET_STATUS, 'READY')
    state.bundler.postMessage({ type: 'READY' })
    const { project, cb } = queue[0] // cloneDeep?
    state.bundler.onmessage = e => {
      const type = get(e, 'data.type', 'ERROR')
      const payload = get(e, 'data.payload', '[Bundler]: no error returned')

      commit(t.BUNDLER_SET_STATUS, 'BUNDLE_READY')
      commit(t.BUNDLER_SET_ACTIVE, null)

      if (type === 'BUNDLE_READY') {
        cb(null, payload)
      } else
        cb(payload, null)

      /**
       * When done, try shift the next so
       * that the queue is emptied.
       */
      dispatch('queueTryShift')
    }
    // state.bundle.onerror

    commit(t.BUNDLER_SHIFT)

    // --- STAGE: UPLOAD
    commit(t.BUNDLER_SET_STATUS, 'UPLOAD')

    // Project files
    if (project.hasOwnProperty('files')) {
      for (let i in project.files) {
        const { type } = project.files[i]
        if (type !== 'file')
          continue

        state.bundler.postMessage({
          type: 'ADD_MODULE',
          payload: project.files[i]
        })
      }
    }

    // --- STAGE: BUNDLE
    commit(t.BUNDLER_SET_STATUS, 'BUNDLE')
    state.bundler.postMessage({ type: 'BUNDLE' })
  }
}

const getters = {
  /**
   * Get a project bundle by ID.
   */
  bundleById: () => async id => {
    try {
      return await CACHE.getItem(id)
    } catch (e) {
      // Start bundle?
      return null
    }
  }
}


export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
