import Amplify from 'aws-amplify'

Amplify.Logger.LOG_LEVEL = process.env.NODE_ENV === 'development'
  ? 'DEBUG'
  : 'ERROR'

Amplify.configure({
  apiGateway: {
    REGION: 'YOUR_API_GATEWAY_REGION',
    URL: 'YOUR_API_GATEWAY_URL'
  }
})
