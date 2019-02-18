import PubNub from 'pubnub'

export default new PubNub({
  publishKey: process.env.VUE_APP_PUBNUB_PUBLISH_KEY || '',
  subscribeKey: process.env.VUE_APP_PUBNUB_SUBSCRIBE_KEY || ''
})
