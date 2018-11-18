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
    let dt = dataTree(state.data)

    // Convert top-leved ID's into integration names
    for (let i in dt) {
      try {
        let integration = dt[i]
        const { key } = integration
        integration.text = rootGetters['Integration/integrationById'](key).label || key
      } catch (e) {
        continue
      }
    }
    return dt
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
