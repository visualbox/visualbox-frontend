import io from 'socket.io-client'

class IO {
  private io

  constructor () {
    this.io = null // io(process.env.VUE_APP_SOCKET_IO_SERVER)
  }

  public reset () {
    if (this.io.disconnected)
      this.io.connect()
    else
      this.io.emit('reset')
  }

  public end () {
    this.io.removeAllListeners()
  }

  public join (token: string) {
    this.io.emit('join', token)
  }

  public emit (type: string, message: object) {
    this.io.emit(type, message)
  }

  public on (type: string, cb: () => void) {
    this.io.on(type, cb)
  }
}

export default new IO()
