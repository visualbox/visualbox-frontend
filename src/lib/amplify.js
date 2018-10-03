import Amplify from '@aws-amplify/core'
import config from '@/config'

Amplify.Logger.LOG_LEVEL = process.env.NODE_ENV === 'development'
  ? 'DEBUG'
  : 'ERROR'

Amplify.configure({
  Auth: {
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.CLIENT_ID
  },
  API: {
    endpoints: [
      {
        name: config.env,
        endpoint: config.apiGateway.ENDPOINT,
        region: config.apiGateway.REGION
      }
    ]
  }
})
