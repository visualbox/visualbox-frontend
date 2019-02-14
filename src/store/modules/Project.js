import Vue from 'vue'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import {
  cloneDeep,
  filesTree,
  isValidPath,
  pathMeta,
  getUniqueName,
  getFullPath
} from '@/lib/utils'

const parseFiles = (opts = {}) => {
  const files = get(opts, 'files', null)
  return !files ? {} : cloneDeep(files)
}

const parseSettings = ({ name = 'Untitled' }) => {
  return { name }
}

const state = {
  ready: false,
  showHelper: false,
  layoutHelper: 'horizontal',

  id: null,
  uid: null,
  files: {},
  settings: {},

  active: null,
  open: new Set(),
  dirty: new Set(),
  peek: null
}

const mutations = {
  [t.PROJECT_RESET] (state) {
    state.ready = false

    // These are nice to disable
    // state.showHelper = false
    // state.layoutHelper = 'horizontal'

    state.id = null
    state.uid = null
    state.files = {}
    state.settings = {}
    state.active = null
    state.open.clear()
    state.dirty.clear()
    state.peek = null
  },
  [t.PROJECT_SET_LOADED] (state, payload) {
    const copy = cloneDeep(payload)

    state.id = payload.id
    state.uid = payload.uid
    state.files = parseFiles(copy)
    state.settings = parseSettings(copy)
    state.ready = true
  },
  [t.PROJECT_SAVE] (state) {
    state.dirty = new Set()
  },
  [t.PROJECT_SET_HELPER] (state, payload) {
    state.showHelper = !!payload
  },
  [t.PROJECT_SET_HELPER_LAYOUT] (state, payload) {
    state.layoutHelper = payload
  },
  [t.PROJECT_ADD_OPEN] (state, payload) {
    state.open.add(payload)
    state.open = new Set(state.open)

    // Adding to open, ergo no longer peek
    if (state.peek === payload)
      state.peek = null
  },
  [t.PROJECT_CLOSE_OPEN] (state, payload) {
    state.open.delete(payload)
    state.open = new Set(state.open)

    // Was peeking, close
    if (state.peek === payload)
      state.peek = null

    // Find new active
    if (state.active === payload) {
      state.active = state.open.size <= 0
                     ? null
                     : [...state.open][state.open.size - 1]
    }
  },
  [t.PROJECT_SET_PEEK] (state, payload) {
    // Cannot be peek if already open
    if (!state.open.has(payload))
      state.peek = payload
    state.active = payload
  },
  [t.PROJECT_SET_ACTIVE] (state, payload) {
    state.active = payload
  },
  [t.PROJECT_WRITE_FILE] (state, { fullPath, contents }) {
    if (!state.files.hasOwnProperty(fullPath))
      return

    const file = state.files[fullPath]
    file.lastModified = +new Date()
    file.contents = contents
    Vue.set(state.files, fullPath, file)

    state.dirty.add(fullPath)
    state.dirty = new Set(state.dirty)

    if (fullPath === state.peek) {
      state.peek = null
      state.open.add(fullPath)
      state.open = new Set(state.open)
    }
  },
  [t.PROJECT_ADD_FILE] (state, { fullPath, item }) {
    if (!isValidPath(fullPath))
      return
    Vue.set(state.files, fullPath, item)
  },
  [t.PROJECT_DELETE_FILE] (state, fullPath) {
    if (!isValidPath(fullPath))
      return
    Vue.delete(state.files, fullPath)
  },
  [t.PROJECT_RENAME_FILE] (state, { fullPath, newFullPath, newName }) {
    if (!isValidPath(fullPath))
      return

    const copy = cloneDeep(state.files[fullPath])
    copy.fullPath = newFullPath
    copy.name = newName
    Vue.delete(state.files, fullPath)
    Vue.set(state.files, newFullPath, copy)

    // Handle dirty state
    state.dirty.delete(fullPath)
    state.dirty.add(newFullPath)
    state.dirty = new Set(state.dirty)
  }
}

const actions = {
  load ({ commit, getters }, project) {
    commit(t.PROJECT_RESET)
    commit(t.PROJECT_SET_LOADED, project)

    // Try to open defaults
    const defaults = ['README.md', 'index.js', 'index.html', 'package.json', 'config.json']
    const rootFiles = getters.filesInFolder().map(({ name }) => name)
    defaults.filter(v => -1 !== rootFiles.indexOf(v)).forEach(file => {
      commit(t.PROJECT_ADD_OPEN, file)
    })

  },
  doubleClick ({ commit }, fullPath) {
    commit(t.PROJECT_ADD_OPEN, fullPath)
  },
  click ({ commit }, fullPath) {
    commit(t.PROJECT_SET_PEEK, fullPath)
  },

  addNestedFile ({ commit }, { fullPath, item }) {
    if (!isValidPath(fullPath))
      return

    const meta = pathMeta(fullPath)

    // Create necessary folders
    for (const i in meta.folders) {
      const curPath = meta.folders.slice(0, i + 1).join('/')
      const curName = meta.folders[i]

      if (state.files.hasOwnProperty(curPath))
        continue

      commit(t.PROJECT_ADD_FILE, {
        fullPath: curPath,
        item: {
          fullPath: curPath,
          name: curName,
          type: 'folder'
        }
      })
    }

    commit(t.PROJECT_ADD_FILE, { fullPath, item })
  },

  deleteNestedFile ({ commit, getters }, fullPath) {
    if (!isValidPath(fullPath))
      return

    const { type } = getters.fileByFullPath(fullPath)
    if (!type)
      return

    if (type === 'file') {
      commit(t.PROJECT_CLOSE_OPEN, fullPath)
      commit(t.PROJECT_DELETE_FILE, fullPath)
    } else {
      const len = fullPath.length
      for (let name in state.files)
        if (name.substr(0, len) === fullPath) {
          const curFullPath = state.files[name].fullPath
          commit(t.PROJECT_CLOSE_OPEN, curFullPath)
          commit(t.PROJECT_DELETE_FILE, name)
        }
    }
  },

  addNewFile ({ dispatch, getters }, folder) {
    // Generate new filename
    const files = getters.filesInFolder(folder, 'file')
    const name = getUniqueName('New File', files)
    const fullPath = getFullPath(folder, name)

    // May need to set dirty here

    const item = {
      fullPath,
      name,
      type: 'file',
      contents: '',
      lastModified: +new Date()
    }

    dispatch('addNestedFile', { fullPath, item })
    return item
  },

  addNewFolder ({ dispatch, getters }, folder) {
    // Generate new filename (foldername)
    const files = getters.filesInFolder(folder, 'folder')
    const name = getUniqueName('New Folder', files)
    const fullPath = getFullPath(folder, name)

    // May need to set dirty here

    const item = {
      fullPath,
      name,
      type: 'folder'
    }

    dispatch('addNestedFile', { fullPath, item })
    return item
  },

  renameNestedFile ({ commit, getters, state }, { fullPath, newName }) {
    if (!isValidPath(fullPath))
      return

    const { type } = getters.fileByFullPath(fullPath)
    if (!type)
      return

    const { folders } = pathMeta(fullPath)
    const newFullPath = getFullPath(folders.join('/'), newName)

    // File already exists
    if (state.files.hasOwnProperty(newFullPath))
      return
    
    if (type === 'file') {
      commit(t.PROJECT_RENAME_FILE, { fullPath, newFullPath, newName })
      commit(t.PROJECT_CLOSE_OPEN, fullPath)
      commit(t.PROJECT_ADD_OPEN, newFullPath)
      commit(t.PROJECT_SET_ACTIVE, newFullPath)
    } else {
      const len = fullPath.length
      const files = cloneDeep(state.files) // Mutating iteratee
      for (let name in files) {
        if (name.substr(0, len) === fullPath) {
          const meta = pathMeta(name)
          commit(t.PROJECT_RENAME_FILE, {
            fullPath: name,
            newFullPath: getFullPath(newFullPath, name.substr(len)),
            newName: meta.name
          })
        }
      }
    }
  },

  save ({ commit, dispatch }, save = true) {
    if (save)
      commit(t.PROJECT_SAVE)

    const { id, files, dependencies, settings } = state

    // Invalidate Cached project
    dispatch('Bundler/invalidateCache', id, { root: true })

    return { id, files, dependencies, settings }
  }
}

const getters = {
  projectFiles: ({ files }) => {
    return filesTree(files)
  },

  fileByFullPath: ({ files }) => fullPath => {
    return get(files, fullPath, null)
  },

  filesInFolder: ({ files }) => (folder = null, fileType = 'file') => {
    const fileValues = Object.values(files)

    // Root
    if (!folder) {
      return fileValues.filter(({ fullPath, type }) => {
        return fullPath.indexOf('/') < 0 && type === fileType
      })
    }

    const len = folder.length
    return fileValues.filter(({ fullPath, type }) => {
      const preCut = fullPath.substr(len)
      return preCut !== ''
             && preCut.indexOf('/') < 0
             && type === fileType
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
