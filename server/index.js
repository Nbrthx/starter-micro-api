const { Server } = require('socket.io')
// const { createServer } = require('http')
// const express = require("express")

// const app = express()
// const httpServer = createServer(app)
// var htmlPath = __dirname+'/../public';
// app.use(express.static(htmlPath));

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const rooms = new Map()

function serverTick(){
  rooms.forEach((roomPlayers, map) => {
    io.to(String(map)).emit('update-player', Array.from(roomPlayers.values()) || []);
  });
  setTimeout(serverTick, 50);
}
serverTick()

let target = 0
function mapRumah(){
  let roomPlayers = rooms.get('rumah');
  if(roomPlayers){
    let players = Array.from(roomPlayers.values())
    if(target >= players.length) target = 0
    let player = players[target]
    if(player) io.to('rumah').emit('enemy-attack', { x: player.x, y: player.y })
    target++
  }
  setTimeout(() => mapRumah(), 500)
}
mapRumah()

const coor = (x, xx = 0) => x*16+xx

io.on('connection', (socket) => {
  console.log('a user '+socket.id+' connected')

  socket.on('ping', callback => {
    callback()
  })

  socket.on('join', (data) => {
    console.log('socket: '+data.id)
    const { map } = data
    
    if (!rooms.has(map)) {
      rooms.set(map, new Map());
    }
    let roomPlayers = rooms.get(map);
    roomPlayers.set(socket.id, data);
    
    socket.emit('join', Array.from(roomPlayers.values()));
    socket.broadcast.to(map).emit('newplayer', data)

    // console.log(roomPlayers)

    socket.join(map)

    socket.on('change-map', (map2) => {
      if (!rooms.has(map2)) {
        rooms.set(map2, new Map());
      }
      let roomPlayers2 = rooms.get(map2);
      roomPlayers2.set(socket.id, data);
      roomPlayers.delete(socket.id)

      socket.broadcast.to(map).emit('leftplayer', socket.id)
      socket.leave(map)
    })
  })

  socket.on('update', (data) => {
    const { map, x, y, health } = data; 
    
    if (!rooms.has(map)) return;
    const roomPlayers = rooms.get(map);
    const player = roomPlayers.get(socket.id);
    if (player) {
        player.x = x;
        player.y = y;
    }
  })

  socket.on('chat', (data) => {
    const { map, text } = data; 
    
    if (!rooms.has(map)) return;
    const roomPlayers = rooms.get(map);
    const player = roomPlayers.get(socket.id);
    if (player) {
        socket.to(map).emit('chat', {
          id: socket.id,
          text: text
        })
    }
  })

  socket.on('disconnect', () => {
    console.log('user '+socket.id+' disconnected')
    rooms.forEach((roomPlayers, map) => {
      if(roomPlayers.has(socket.id)){
        roomPlayers.delete(socket.id)
        socket.broadcast.to(map).emit('leftplayer', socket.id)
        socket.leave(map)
      }
      // You might also want to check if the room is empty and clean it up if needed
    });
  })
})

io.listen(3000);
console.log(`Socket.IO server running at http://localhost:${io.httpServer.address().port}`)