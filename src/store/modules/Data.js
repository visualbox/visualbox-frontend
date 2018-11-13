import * as _ from 'lodash'
import * as t from '@/store/types'
import cloneDeep from '@/lib/cloneDeep'

const state = {
  data: {}
}

const mutations = {
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
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
