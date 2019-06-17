const TICK_INTERVAL = 15000

interface IWSMessage {
  action: 'join' | 'leave' | 'message'
  type?: 'TICK' | 'INIT' | 'TERMINATE' | 'INFO' | 'OUTPUT' | 'WARNING' | 'ERROR'
  room?: string
  i?: string
  data?: string
}

class WS {
  private socket: WebSocket
  private tick: NodeJS.Timeout | null
  private room: string | null

  constructor () {
    this.socket = new WebSocket(process.env.VUE_APP_WEBSOCKET_ENDPOINT || '')
    this.tick = null
    this.room = null

    // this.socket.onclose = e => {}
    // this.socket.onerror = e => {}
    // this.socket.onmessage = e => {}
  }

  public messageTick () {
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

  public join (room: string, cb: (message: IWSMessage) => void) {
    try {
      this.send({
        action: 'join',
        room
      })
      this.socket.onmessage = ({ data }) => {
        try {
          const message = JSON.parse(data) as IWSMessage
          cb(message)
        } catch (e) {
          console.log('[WS]: onmessage failed: ', e)
        }
      }

      this.room = room

      if (!this.tick)
        this.tick = setInterval(() => this.messageTick(), TICK_INTERVAL)

    } catch (e) {
      console.log('[WS]: join failed: ', e)
    }
  }

  public leave () {
    if (!this.room)
      return

    try {
      this.messageTerminate()
      this.send({
        action: 'leave',
        room: this.room
      })
      this.socket.onmessage = null
      this.room = null

      if (this.tick)
        clearInterval(this.tick)

    } catch (e) {
      console.log('[WS]: leave failed: ', e)
    }
  }

  private send (message: IWSMessage) {
    try {
      this.socket.send(JSON.stringify(message))
    } catch (e) {
      throw e
    }
  }
}

export default new WS()
