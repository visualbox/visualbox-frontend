const dev = {
  env: 'dev',
  apiGateway: {
    REGION: process.env.VUE_APP_REGION || undefined,
    ENDPOINT: process.env.VUE_APP_API_GATEWAY_ENDPOINT || undefined
  },
  cognito: {
    REGION: process.env.VUE_APP_REGION || undefined,
    USER_POOL_ID: process.env.VUE_APP_USER_POOL_ID || undefined,
    CLIENT_ID: process.env.VUE_APP_CLIENT_ID || undefined,
    IDENTITY_POOL_ID: process.env.VUE_APP_IDENTITY_POOL_ID || undefined
  },
  s3: {
    REGION: process.env.VUE_APP_REGION || undefined,
    BUCKET_INTEGRATION: process.env.VUE_APP_BUCKET_INTEGRATION || undefined,
    BUCKET_WIDGET: process.env.VUE_APP_BUCKET_WIDGET || undefined,
  }
}

const prod = {
  env: 'prod',
  apiGateway: {
    REGION: process.env.VUE_APP_REGION || undefined,
    ENDPOINT: process.env.VUE_APP_API_GATEWAY_ENDPOINT || undefined
  },
  cognito: {
    REGION: process.env.VUE_APP_REGION || undefined,
    USER_POOL_ID: process.env.VUE_APP_USER_POOL_ID || undefined,
    CLIENT_ID: process.env.VUE_APP_CLIENT_ID || undefined,
    IDENTITY_POOL_ID: process.env.VUE_APP_IDENTITY_POOL_ID || undefined
  },
  s3: {
    REGION: process.env.VUE_APP_REGION || undefined,
    BUCKET_INTEGRATION: process.env.VUE_APP_BUCKET_INTEGRATION || undefined,
    BUCKET_WIDGET: process.env.VUE_APP_BUCKET_WIDGET || undefined,
  }
}

const config = process.env.NODE_ENV === 'development'
  ? dev
  : prod

export default {
  ...config
}
