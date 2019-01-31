import API from '@aws-amplify/api'
import config from '@/config'

const { env } = config

export default (method, path, opts) => {
  switch (method) {
    case 'get': return API.get(env, path, opts)
    case 'post': return API.post(env, path, opts)
    case 'put': return API.put(env, path, opts)
    case 'del': return API.del(env, path, opts)
    case 'head': return API.head(env, path, opts)
    default: return API.get(env, path)
  }
}
