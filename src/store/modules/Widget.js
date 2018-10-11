import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'

const state = {
  loaded: null,
  list: []
}

const mutations = {
  [t.WIDGET_LOAD] (state, payload) {
    state.loaded = _.clone(payload)
  },
  [t.WIDGET_SET_LIST] (state, payload) {
    state.list = _.clone(payload)
  },
  [t.WIDGET_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.WIDGET_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  }
}

const actions = {
  // Load a widget by making a local copy
  load ({ commit, getters }, id) {
    commit(t.WIDGET_LOAD, getters.widgetById(id))
  },
  async list ({ commit }, payload) {
    let result = [] // Default value

    try {
      result = await API.get(config.env, '/widget')
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_LIST, result)
    }
  },
  async create ({ commit }) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/widget'))
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
      await API.del(config.env, `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {}
  }
}

const getters = {
  loaded (state) {
    return state.loaded
  },
  list (state) {
    return state.list
  },
  widgetById: state => id => {
    return state.list.find(i => i.id === id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
