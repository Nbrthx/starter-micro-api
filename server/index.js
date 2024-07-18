import geckos from '@geckos.io/server'
import http from 'http'

const server = http.createServer()
const io = geckos()

io.addServer(server)

io.onConnection(channel => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
  })

  channel.on('chat message', data => {
    console.log(`got ${data} from "chat message"`)
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit('chat message', data)
  })
})

server.listen(3000)