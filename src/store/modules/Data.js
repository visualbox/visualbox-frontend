import * as _ from 'lodash'
import * as t from '@/store/types'
import cloneDeep from '@/lib/cloneDeep'
import dataTree from '@/lib/dataTree'

const state = {
  data: {}
}

const mutations = {
  [t.DATA_RESET] (state) {
    state.data = {}
  },
  [t.DATA_SET_DATA] (state, { id, data }) {
    state.data[id] = cloneDeep(data)
    state.data = _.cloneDeep(state.data)
  },
  [t.DATA_CLEAN_DATA] (state, ids) {
    ids.forEach(id => {
      delete state.data[id]
    })
  }
}

const actions = {
}

const getters = {
  dataTree (state, getters, rootState, rootGetters) {
    // Convert top-leved ID's into integration names
    /*
    let convertedId = {}
    for (let id in state.data) {
      // Try to get it, if 'undefined', use ID
      const name = rootGetters['Integration/integrationById'](id).label || id
      convertedId[name] = state.data[id]
    }
    */

    return dataTree(state.data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
