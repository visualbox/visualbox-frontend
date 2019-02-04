import Vue from 'vue'
import * as t from '@/store/types'
import API from '@/service/API'
import { cloneDeep } from '@/lib/utils'

const state = {
  list: [],
  public: []
}

const mutations = {
  [t.WIDGET_RESET] (state) {
    state.list = []
    state.public = []
  },
  [t.WIDGET_SET_LIST] (state, payload) {
    state.list = cloneDeep(payload)
  },
  [t.WIDGET_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.WIDGET_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.WIDGET_COMMIT] (state, project) {
    const index = state.list.findIndex(({ id }) => id === project.id)
    if (index >= 0)
      Vue.set(state.list, index, project)
  },
  [t.WIDGET_CLEAN_DASHBOARD] (state, widgets) {
    // Remove every widget that does not exist in list
    widgets.forEach(w => {
      const index = state.list.findIndex(a => a.id === w.id)
      if (index < 0)
        widgets.splice(index, 1)
    })
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.invoke('get', '/widget')
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/widget', {
        body: { id }
      }))
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    // Immediately remove widget from local app
    commit(t.WIDGET_DELETE_LIST, id)

    try {
      await API.invoke('del', `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },

  async commit ({ commit, getters }, project) {
    try {
      const { id } = project
      const old = getters.widgetById(id)
      if (!old)
        return

      const { uid, createdAt } = old
      project.uid = uid
      project.createdAt = createdAt
      project.updatedAt = +new Date()

      commit(t.WIDGET_COMMIT, project)
      await API.invoke('put', `/widget/${id}`, { body: project })
    } catch (e) {
      throw e
    }
  },

  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.invoke('get', `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_PUBLIC, result)
    }
  }
}

const getters = {
  /**
   * Get a widget by ID.
   */
  widgetById: ({ list }) => id => {
    return list.find(i => i.id === id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
