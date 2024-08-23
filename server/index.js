const { Server } = require('socket.io')
const sha256 = require('sha256')
const mysql = require('mysql');
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

// Server Tick
function serverTick(){
  rooms.forEach((roomPlayers, map) => {
    io.to(String(map)).emit('update-player', Array.from(roomPlayers.values()) || []);
  });
  setTimeout(serverTick, 50);
}
serverTick()

// Map Rumah
let target = 0
let home = [0,0,0,0,0]
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

// Accounts
const accounts = []
const clients = new Map()
const items = {
  pohon: 0,
  ember: 1,
  kayu: 2
}

var connection = mysql.createConnection({
  host     : 'sql12.freesqldatabase.com',
  user     : 'sql12727379',
  password : '8iHptZS1sz',
  database : 'sql12727379'
});
connection.query('SELECT * FROM accounts', function (error, results, fields) {
      if (error) throw error;
      const data = results
      console.log('The solution is: ', data);

      data.forEach(v => {
        accounts.push({
          username: v.username,
          hash: v.hash,
          head: JSON.parse(v.head),
          outfit: JSON.parse(v.outfit),
          xp: v.xp,
          inventory: JSON.parse(v.inventory)
        })
      })
    })

// Socket io
io.on('connection', (socket) => {
  console.log('a user '+socket.id+' connected')

  socket.on('ping', callback => {
    callback()
  })

  // Account
  socket.on('register', (data, callback) => {
    const username = accounts.find(v => v.username == data.username)
    if(username){
      callback(false)
      return
    }
    const account = {
      username: data.username,
      hash: sha256(data.hash),
      head: [],
      outfit: [],
      xp: 0,
      inventory: [0, 0, 0] // Pohon, Ember, Kayu
    }
    accounts.push(account)
    callback(true)

    connection.query('INSERT INTO accounts VALUES ("'+account.username+
    '", "'+account.hash+
    '", "'+JSON.stringify(account.head)+
    '", "'+JSON.stringify(account.outfit)+
    '", '+account.xp+
    ', "'+JSON.stringify(account.inventory)+'")', function (error, results, fields) {
      if (error) throw error;
    })
  })

  socket.on('login', (text, callback) => {
    const account = accounts.find(v => v.hash == sha256(text))
    console.log(clients, account)
    if(account){
      let hasLogin = false
      clients.forEach(v => {
        hasLogin = v == account.username
      })
      if(hasLogin) callback(false)
      else{
        clients.set(socket.id, account.username)
        callback(account.username)
      }
    }
    else callback(false)
  })

  socket.on('get-account', callback => {
    const account = accounts.find(v => v.username == clients.get(socket.id))
    callback(account)
  })


  // Player Connection
  socket.on('join', (data) => {
    const { map } = data
    
    if (!rooms.has(map)) {
      rooms.set(map, new Map());
    }
    let roomPlayers = rooms.get(map);
    roomPlayers.set(socket.id, data);
    
    socket.emit('join', Array.from(roomPlayers.values()));
    socket.broadcast.to(map).emit('newplayer', data)

    if(map == 'rumah') socket.emit('home', home)

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

  // Inventory
  socket.on('inventory-update', (operation, name, amount) => {
    const account = accounts.find(v => v.username == clients.get(socket.id))
    
    console.log(operation, name, amount)
    if(!account) return
    if(operation == 'add') account.inventory[items[name]] += amount
    else if(operation == 'sub') account.inventory[items[name]] -= amount
    else if(operation == 'set') account.inventory[items[name]] = amount

    connection.query('UPDATE accounts SET inventory = "'+JSON.stringify(account.inventory)+'" WHERE username="'+account.username+'"', function (error, results, fields) {
      if (error) throw error;
    })
  })

  // Experience
  socket.on('xp-update', (amount) => {
    const account = accounts.find(v => v.username == clients.get(socket.id))
    
    if(!account) return
    account.xp += amount

    connection.query('UPDATE accounts SET xp = '+account.xp+' WHERE username="'+account.username+'"', function (error, results, fields) {
      if (error) throw error;
    })
  })

  // Map Rumah
  socket.on('home', (data) => {
    home[data.id] = data.itr
    let complete = true
    home.forEach(v => {
      if(v < 3) complete = false
    })
    if(complete) home = [0,0,0,0,0]
  })


  // Player Disconnect
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
    clients.delete(socket.id)
  })
})

io.listen(3000);
console.log(`Socket.IO server running at http://localhost:${io.httpServer.address().port}`)