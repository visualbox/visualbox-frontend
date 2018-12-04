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
  [t.DATA_SET_DATA] (state, { i, data }) {
    state.data[i] = cloneDeep(data)
    state.data = _.cloneDeep(state.data)
  },
  [t.DATA_CLEAN_DATA] (state, is) {
    is.forEach(i => {
      delete state.data[i]
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
        integration.text = rootGetters['Dashboard/integrationByI'](key).settings.label || key
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
