import Vue from 'vue'
import JSZip from 'jszip'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import isObject from 'lodash-es/isObject'
import {
  cloneDeep,
  isValidPath,
  pathMeta,
  getFullPath
} from '@/lib/utils'

const getUniqueName = (prefix, folder) => {
  let i = 1
  let uniqueName = prefix
  while (Object.keys(folder.files).find(name => name === uniqueName)) {
    uniqueName = `${prefix} (${i})`
    i++
  }
  return uniqueName
}

const getDisplayName = (name, dir) => {
  try {
    const arr = name.split('/')
    return dir ? arr[arr.length - 2]: arr.pop()
  } catch (e) {
    console.log(e)
    return name
  }
}

const parseSettings = (opts = {}) => {
  const settings = get(opts, 'settings', null)
  return !settings ? {} : cloneDeep(settings)
}

const parseVersions = (opts = {}) => {
  const versions = get(opts, 'versions', null)
  return !versions ? false : cloneDeep(versions)
}

const state = {
  ready: false,
  showInfo: true,
  showSettings: false,
  showHelper: false,
  layoutHelper: 'horizontal',

  id: null,
  uid: null,
  zip: new JSZip(),
  fileTree: [],
  settings: {},
  versions: {},

  active: null,
  open: new Set(),
  dirty: new Set(),
  peek: null
}

const mutations = {
  [t.PROJECT_RESET] (state) {
    state.ready = false

    state.showInfo = true
    state.showSettings = false
    state.showHelper = false
    state.layoutHelper = 'horizontal'

    state.id = null
    state.uid = null
    state.zip = new JSZip()
    state.fileTree = []
    state.settings = {}
    state.versions = {}

    state.active = null
    state.open.clear()
    state.dirty.clear()
    state.peek = null
  },
  [t.PROJECT_SET_LOADED] (state, payload) {
    const copy = cloneDeep(payload)

    state.id = payload.id
    state.uid = payload.uid
    state.settings = parseSettings(copy)
    state.versions = parseVersions(copy)
    state.ready = true
  },
  [t.PROJECT_SET_ZIP] (state, zip) {
    state.zip = zip
  },
  [t.PROJECT_SET_FILE_TREE] (state, fileTree) {
    state.fileTree = fileTree
  },
  [t.PROJECT_SET_SETTINGS] (state, { key, value }) {
    Vue.set(state.settings, key, value)
  },
  [t.PROJECT_SET_VERSIONS] (state, { id, versions }) {
    if (id === state.id)
      state.versions = versions
  },
  [t.PROJECT_SAVE] (state) {
    state.dirty = new Set()
  },
  [t.PROJECT_SHOW_INFO] (state) {
    state.showInfo = true
    state.showSettings = false
  },
  [t.PROJECT_SHOW_SETTINGS] (state) {
    state.showInfo = false
    state.showSettings = true
  },
  [t.PROJECT_SHOW_HELPER] (state, payload) {
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

    // Disable open info/settings
    state.showInfo = false
    state.showSettings = false
  },
  [t.PROJECT_SET_ACTIVE] (state, payload) {
    state.active = payload

    // Disable open info/settings
    state.showInfo = false
    state.showSettings = false
  },
  [t.PROJECT_WRITE_FILE] (state, { name, contents }) {
    state.zip.file(name, contents)
    state.dirty.add(name)
    state.dirty = new Set(state.dirty)

    if (name === state.peek) {
      state.peek = null
      state.open.add(name)
      state.open = new Set(state.open)
    }
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
  async load ({ commit, dispatch }, { project, signedUrl }) {
    commit(t.PROJECT_RESET)
    commit(t.PROJECT_SET_LOADED, project)

    if (!signedUrl)
      return

    /**
     * Fetch ZIP from signedUrl.
     */
    try {
      const result = await fetch(signedUrl)
      const blob = await result.blob()
      const zip = await JSZip.loadAsync(blob)

      commit(t.PROJECT_SET_ZIP, zip)
      dispatch('calculateFileTree')
    } catch (e) {
      console.log(e)
    }
  },
  doubleClick ({ commit }, name) {
    commit(t.PROJECT_ADD_OPEN, name)
  },
  click ({ commit }, name) {
    commit(t.PROJECT_SET_PEEK, name)
  },

  calculateFileTree ({ commit, state }) {
    const convertLevel = (lvl, folder) => {
      let outFolder = []

      folder.forEach((_, file) => {
        const { name, dir } = file

        // JSZip bug, disregard subfolder item
        const relName = name.substring(folder.root.length, name.length)
        const index = relName.indexOf('/')
        if (index >= 0 && index < relName.length - 1)
          return

        // Generate display name
        const displayName = getDisplayName(name, dir)

        const item = { name, displayName, dir }

        if (dir)
          item.children = convertLevel(lvl + 1, state.zip.folder(name))

        outFolder.push(item)
      })

      return outFolder
    }
    const level = convertLevel(0, state.zip)
    commit(t.PROJECT_SET_FILE_TREE, level)
  },

  add ({ dispatch, state }, { parent = '', dir = false, prefix = 'New File' }) {
    try {
      // Convert to folder
      const folder = state.zip.folder(parent)
      const name = getUniqueName(prefix, folder)

      if (dir)
        folder.folder(name)
      else
        folder.file(name, '')

      dispatch('calculateFileTree')

      return {
        name,
        displayName: getDisplayName(name, dir)
      }
    } catch (e) {
      console.log(e)
    }
  },

  del ({ dispatch, state }, name) {
    try {
      state.zip.remove(name)
      dispatch('calculateFileTree')
    } catch (e) {
      console.log(e)
    }
  },

  async rename ({ commit, dispatch, state }, { name, newName, dir }) {
    try {
      if (!dir) {
        const contents = await state.zip.file(name).async('text')
        state.zip.file(newName, contents)
        state.zip.remove(name)
        commit(t.PROJECT_CLOSE_OPEN, name)
        commit(t.PROJECT_ADD_OPEN, newName)
        commit(t.PROJECT_SET_ACTIVE, newName)
      }

      dispatch('calculateFileTree')
      // !dir
      // read contents, create new file
      // delete old file
    } catch (e) {
      console.log(e)
    }
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

  /**
   * Return project metadata for
   * integration/widget to save in API.
   */
  save ({ state }) {
    const { id, settings, versions } = state
    return { id, settings, versions }
  },

  /**
   * Return ID and ZIP blob for
   * integration/widget to save in API.
   */
  async saveFiles ({ commit, state }) {
    commit(t.PROJECT_SAVE)

    // Generate ZIP blob
    try {
      const { id } = state
      const blob = await state.zip.generateAsync({ type: 'blob' })

      return { id, blob }
    } catch (e) {
      throw e
    }
  }
}

const getters = {
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
  },

  /**
   * Return the registry version of the project.
   * 0  - not been published before
   * -1 - published but later removed
   * >0 - latest version
   */
  registryVersion: ({ versions }) => {
    if (!isObject(versions))
      return -1
    
    const keys = Object.keys(versions)
    return (keys.length <= 0)
      ? 0
      : Math.max(...keys)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
