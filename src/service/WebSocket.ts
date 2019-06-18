import Auth from '@aws-amplify/auth'

const TICK_INTERVAL = 15000

interface IWSMessage {
  action: 'join' | 'leave' | 'message'
  type?: 'TICK' | 'INIT' | 'TERMINATE' | 'INFO' | 'OUTPUT' | 'WARNING' | 'ERROR'
  room?: string
  i?: string
  data?: string
  meta?: string
}

class WS {
  private socket: WebSocket | null
  private tick: NodeJS.Timeout | null
  private room: string | null

  constructor () {
    this.socket = null
    this.tick = null
    this.room = null

    // this.socket.onclose = e => {}
    // this.socket.onerror = e => {}
    // this.socket.onmessage = e => {}
  }

  public messageTick () {
    console.log('TICK', this.room)
    if (!this.room)
      return

    this.send({
      action: 'message',
      type: 'TICK',
      room: this.room
    })
  }

  public messageTerminate (i?: string) {
    if (!this.room)
      return

    this.send({
      action: 'message',
      type: 'TERMINATE',
      room: this.room,
      i
    })
  }

  public async join (
    room: string,
    cb: (message: IWSMessage) => void,
    meta: string = 'client',
    startTick: boolean = true
  ) {
    try {
      this.leave()

      this.socket = new WebSocket(await this.getEndpoint())
      this.socket.onmessage = ({ data }) => {
        try {
          const message = JSON.parse(data) as IWSMessage
          cb(message)
        } catch (e) {
          console.log('[WS]: onmessage failed: ', e)
        }
      }
      this.socket.onopen = () => {
        this.send({
          action: 'join',
          meta,
          room
        })
      }

      this.room = room

      if (!this.tick && startTick)
        this.tick = setInterval(() => this.messageTick(), TICK_INTERVAL)

    } catch (e) {
      console.log('[WS]: join failed: ', e)
    }
  }

  public leave () {
    if (!this.socket || !this.room)
      return

    try {
      this.messageTerminate()
      this.send({
        action: 'leave',
        room: this.room
      })
      this.socket.close()
      this.socket = null
      this.room = null

      if (this.tick)
        clearInterval(this.tick)

    } catch (e) {
      console.log('[WS]: leave failed: ', e)
    }
  }

  private send (message: IWSMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN)
      return

    try {
      this.socket.send(JSON.stringify(message))
    } catch (e) {
      throw e
    }
  }

  private async getEndpoint () {
    const endpoint = process.env.VUE_APP_WEBSOCKET_ENDPOINT || ''
    return endpoint

    /*
    let token = 'anonymous'

    try {
      token = (await Auth.currentSession()).getIdToken().getJwtToken()
    } catch (e) {
      // Silent...
    }

    return `${endpoint}?token=${token}`
    */
  }
}

export default new WS()
