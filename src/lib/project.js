import isObject from 'lodash-es/isObject'
import isString from 'lodash-es/isString'
import isNumber from 'lodash-es/isNumber'
import { cloneDeep } from '@/lib/utils'

export default class Project {
  constructor (opts = {}) {
    opts = isObject(opts) ? opts : {}

    const { id, uid } = opts
    this.id = id || null
    this.uid = uid || null

    this.files = this.parseFiles(opts)
    this.dependencies = this.parseDependencies(opts)
    this.settings = this.parseSettings(opts)

    this.open = []
    this.dirty = []
    this.peek = null
  }

  parseFiles (opts) {
    const { files } = opts
    let out = {}

    if (!files)
      return out

    for (let i in files) {
      let { contents, lastModified, type } = files[i]

      // Ensure contents is String
      contents = isString(contents) ? contents : ''

      // Ensure fullPath is same as key
      const fullPath = i

      // Ensure lastModified is number
      lastModified = isNumber(lastModified) ? lastModified : +new Date()

      // Ensure name is last in fullPath
      const nameSplit = fullPath.split('/')
      const name = nameSplit[nameSplit.length - 1]

      // Ensure name is folder/file
      type = type === 'file' ? type : 'folder'

      out[fullPath] = {
        contents,
        fullPath,
        lastModified,
        name,
        type
      }
    }

    return out
  }

  parseDependencies (opts) {
    const { dependencies } = opts
    let out = {
      externalDeps: [],
      externalResources: [],
      jpack: {
        appDependencies: {},
        resDependencies: {},
        warnings: {}
      }
    }

    if (!dependencies)
      return out
    
    try {
      out.jpack.appDependencies = dependencies.jpack.appDependencies
    } catch (e) {}
    try {
      out.jpack.resDependencies = dependencies.jpack.resDependencies
    } catch (e) {}
    try {
      out.jpack.warnings = dependencies.jpack.warnings
    } catch (e) {}

    return out
  }

  parseSettings (opts) {
    return {}
  }

  /**
   * Parse package.json and find public field.
   */
  isPublic () {
    try {
      const pkg = JSON.parse(this.files['package.json'])
      return !!pkg.public
    } catch (e) {
      return false
    }
  }

  /**
   * Return a serialized copy.
   */
  copy () {
    return {
      id: this.id,
      uid: this.uid,
      files: cloneDeep(this.files),
      dependencies: cloneDeep(this.dependencies),
      settings: cloneDeep(this.settings)
    }
  }

  addFile ({ fullPath, contents, type }) {
    const nameSplit = fullPath.split('/')
    const name = nameSplit[nameSplit.length - 1]

    type = type === 'file' ? type : 'folder'

    this.files[fullPath] = {
      contents,
      fullPath,
      lastModified: +new Date(),
      name,
      type
    }
  }
}
