interface IWSMessage {
  action: 'join' | 'leave' | 'message'
  type?: 'TICK' | 'INIT' | 'TERMINATE' | 'INFO' | 'OUTPUT' | 'WARNING' | 'ERROR'
  room?: string
  i?: string
  data?: string
}

class WS {
  private socket: WebSocket
  private cbMap: { [room: string]: (message: IWSMessage) => void }

  constructor () {
    this.cbMap = {}
    this.socket = new WebSocket(process.env.VUE_APP_WEBSOCKET_ENDPOINT || '')

    this.socket.onclose = e => {

    }
    
    this.socket.onerror = e => {

    }
    
    this.socket.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(data) as IWSMessage

        // Route message to room cb
        if (message.room) {
          if (this.cbMap[message.room])
            this.cbMap[message.room](message)

        // Send to 'global' cb?
        } else {
          console.log('[WS]: onmessage: no room parameter in message', message)
        }
      } catch (e) {
        console.log('[WS]: onmessage failed: ', e)
      }
    }
  }

  public send (message: IWSMessage) {
    try {
      this.send(message)
    } catch (e) {
      throw e
    }
  }

  public join (room: string, cb: (message: IWSMessage) => void) {
    try {
      this.send({
        action: 'join',
        room
      })
      this.cbMap[room] = cb
    } catch (e) {

    }
  }
}

export default new WS()
