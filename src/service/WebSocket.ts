const TICK_INTERVAL = 25000

interface IWSMessage {
  action: 'join' | 'leave' | 'message'
  type?: 'TICK' | 'INIT' | 'TERMINATE' | 'RESTART' | 'INFO' | 'OUTPUT' | 'WARNING' | 'ERROR'
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
    if (!this.room)
      return

    this.send({
      action: 'message',
      type: 'TICK',
      room: this.room
    })
  }

  public messageTerminate (i?: string) {
    if (!this.room || !this.socket)
      return

    this.send({
      action: 'message',
      type: 'TERMINATE',
      room: this.room,
      i
    })

    if (!i)
      this.socket.onmessage = null
  }

  public messageRestart ({ i, model }) {
    if (!this.room || !this.socket)
      return

    this.send({
      action: 'message',
      type: 'RESTART',
      room: this.room,
      i,
      data: JSON.stringify(model)
    })

    if (!i)
      this.socket.onmessage = null
  }

  public async join (
    room: string,
    meta: string = 'client',
    startTick: boolean = true,
    cb: (message: IWSMessage) => void
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
    return process.env.VUE_APP_WEBSOCKET_ENDPOINT || ''
  }
}

export default new WS()
