import Amplify from 'aws-amplify'
import { AWS } from '@/config'

Amplify.Logger.LOG_LEVEL = process.env.NODE_ENV === 'development'
  ? 'DEBUG'
  : 'ERROR'

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: AWS.cognito.REGION,
    userPoolId: AWS.cognito.USER_POOL_ID,
    identityPoolId: AWS.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: AWS.cognito.APP_CLIENT_ID
  }
})
