const { WebSocketServer } = require('ws')
const crypto = require("crypto")
const { createServer } = require("http")

const server = createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', function connection(ws) {
  ws.isAlive = true
  ws.id = crypto.randomBytes(9).toString("hex")

  ws.on('error', console.error)

  ws.on('message', data => {
    if(data == "ping"){
      ws.isAlive = true
      return
    }
    if(data == "getping") ws.send(data)
    console.log('received: %s', data)
    wss.clients.forEach(_ws => {
      if(ws.id == _ws.id) return
      _ws.send(data)
    })
  })

  ws.on("close", function() {
    wss.clients.forEach(_ws => {
      _ws.send(JSON.stringify({ left: ws.id }))
    })
  });

  wss.clients.forEach(_ws => {
    if(ws.id == _ws.id) ws.send(JSON.stringify({ main: _ws.id }))
    else _ws.send(JSON.stringify({ reqpos: _ws.id }))
  })
})

const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false){
      console.log(ws.id, "left the game")
      return ws.terminate()
    }
    ws.isAlive = false
  })
}, 30000)

wss.on('close', () => {
  clearInterval(interval);
});

server.listen(3000)
console.log("Listen on:", 3000)
