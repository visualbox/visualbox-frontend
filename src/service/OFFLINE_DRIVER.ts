import isArray from 'lodash-es/isArray'
import uuid from 'uuid'
import localforage from 'localforage'
import _API from '@aws-amplify/api'
import config from '@/config'
import { mergeDeep } from '@/lib/utils'

const { env } = config
const API = localforage.createInstance({
  name: env
})

const setList = async (key: string, value: any, matchKey: string) => {
  try {
    const list = await API.getItem(key)

    /**
     * Not an Array. Create Array, set value
     * and return.
     */
    if (!isArray(list))
      return await API.setItem(key, [ value ])

    const index = list.findIndex(item => item[matchKey] === value[matchKey])

    // Not found, just push it
    if (index < 0)
      list.push(value)
    // Replace
    else
      list[index] = value

    // Write back
    return API.setItem(key, list)
  } catch (e) {
    throw e
  }
}

const post = async (type: string, item: IObject) => {
  try {
    const key = `${type}/${item.id}`
    await API.setItem(key, item)

    // Update list
    await setList(type, item, 'id')
    return item
  } catch (e) {
    throw e
  }
}

const putParam = async (type: string, id: string, body: IObject) => {
  try {
    const key = `${type}/${id}`
    const old: IObject = await API.getItem(key) // TODO: handle not found
    const merged = mergeDeep(old, body)

    // Re-assign write protected properties
    merged.uid = old.uid
    merged.id = old.id
    merged.createdAt = old.createdAt

    await API.setItem(key, merged)

    // Update list
    await setList(type, merged, 'id')
    return merged
  } catch (e) {
    throw e
  }
}

export default async (method: string, path: string, opts?: IObject) => {
  try {
    console.log(`OFFLINE: ${method} ${path} ${opts}`)

    // Remove '/' at beginning
    path = path.charAt(0) === '/' ? path.substr(1) : path

    // parse potential single param
    const [ resource, param ] = path.split('/')

    switch (method) {
      case 'get':
        /**
         * Param is present.
         */
        if (param) {
          /**
           * GET /integration/{id}
           * Get a public integration
           */
          if (resource === 'integration')
            return _API.get(env, `/integration/${param}`, null)

          /**
           * GET /widget/{id}
           * Get a public widget
           */
          else if (resource === 'widget')
            return _API.get(env, `/widget/${param}`, null)

          /**
           * GET /cdn/{package}
           * Turbo CDN
           */
          else if (resource === 'cdn')
            return await _API.get(env, `/cdn/${param}`, null)
        }

        const item = await API.getItem(`/${path}`)
        return item || []
      case 'post':

        /**
         * Body is present.
         */
        if (opts) {
          /**
           * POST /dashboard { id: x }
           * Copy existing integration
           */
          if (resource === 'integration') {

          /**
           * POST /widget { id: x }
           * Copy existing widget
           */
          } else if (resource === 'widget') {

          /**
           * POST /resolver { name, version }
           * Turbo resolver
           */
          } else if (resource === 'resolver')
            return await _API.post(env, '/resolver', opts)
        }

        /**
         * POST /dashboard
         * Create a new dashboard.
         */
        if (resource === 'dashboard') {
          return await post('/dashboard', {
            uid: 0,
            id: uuid.v1(),
            label: 'New Dashboard',
            settings: {
              rgba: {
                r: 241,
                g: 241,
                b: 241,
                a: 1
              }
            },
            widgets: [],
            integrations: [],
            createdAt: Date.now()
          })

        /**
         * POST /integration
         * Create a new integration
         * TODO: support POST /integration/{id} for copying integration
         */
        } else if (resource === 'integration') {
          return post('/integration', {
            uid: 0,
            id: uuid.v1(),
            source: '// Source code\n',
            readme: '# Readme\n',
            config: '[]\n',
            package: {
              name: 'New Integration',
              version: '1.0.0',
              public: false,
              tags: [],
              dependencies: {}
            },
            updatedAt: Date.now(),
            createdAt: Date.now()
          })

        /**
         * POST /widget
         * Create a new widget
         * TODO: support POST /widget/{id} for copying widget
         */
        } else if (resource === 'widget') {
          return post('/widget', {
            uid: 0,
            id: uuid.v1(),
            source: '<span>Source code</span>\n',
            readme: '# Readme\n',
            config: '[]\n',
            package: {
              name: 'New Widget',
              version: '1.0.0',
              public: false,
              tags: [],
              dependencies: {}
            },
            updatedAt: Date.now(),
            createdAt: Date.now()
          })
        }
        break
      case 'put':

        /**
         * Param is present.
         */
        if (param) {
          const id = param
          const body = opts && opts.body ? opts.body : {}

          /**
           * PUT /dashboard/{id}
           * Commit a local dashboard
           */
          if (resource === 'dashboard')
            return await putParam('/dashboard', id, body)

          /**
           * PUT /widget/{id}
           * Commit a local widget
           */
          else if (resource === 'widget')
            return await putParam('/widget', id, body)

          /**
           * PUT /integration/{id}
           * Commit a local integration
           */
          else if (resource === 'integration')
            return await putParam('/integration', id, body)
        }
        break
      // case 'del': return API.del(env, path, opts)
      // case 'head': return API.head(env, path, opts)
      default:
        console.warn(`OFFLINE: ${method} not applicable`)
        return null
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}
