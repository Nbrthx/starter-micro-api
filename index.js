// Suggested code may be subject to a license. Learn more: ~LicenseLog:635663492.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3108541551.
import { Server } from 'socket.io'

const io = new Server()

const players = {}
const maps = {
  'lobby': {}
}
const roomlist = {}

function serverTick(){
  io.to('lobby').emit('update-player', maps['lobby']);
  setTimeout(serverTick, 50);
}

setTimeout(serverTick, 50);

io.on('connection', (socket) => {
  console.log('user '+socket.id+' connected');

  socket.on("player-pos", (data) => {
    socket.broadcast.to(data.map).emit('player-pos', data);
    maps[data.map][socket.id] = data;
  })

  socket.on("ping", data => {
    socket.emit("pong", data);
  })

  socket.on('get-player', (data) => {
    socket.emit('get-player', maps[data]);
  })

  socket.on('join-map', (data) => {
    socket.join(data.map);
    socket.broadcast.to(data.map).emit('new-player', data);
    maps[data.map][socket.id] = data;
    roomlist[socket.id] = data.map;
  })

  socket.on('leave-map', (data) => {
    socket.leave(data.map);
    socket.broadcast.to(data.map).emit('left-player', socket.id);
    delete maps[data.map][socket.id];
  })
  
  socket.on('disconnect', () => {
    console.log('user '+socket.id+' disconnected');
    socket.broadcast.emit('left-player', socket.id);
    
    if(maps[roomlist[socket.id]])
      if(maps[roomlist[socket.id]][socket.id])
        delete maps[roomlist[socket.id]][socket.id];
    if(roomlist[socket.id])
      delete roomlist[socket.id];
  })
})

io.listen(process.env.PORT || 3000);
console.log(`Socket.IO server running at http://localhost:${io.httpServer.address().port}`)



