const { createServer } = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(socket.id+" joined server")
  
  socket.on("disconnect", msg => {
    console.log(socket.id+" left server")
  })
});

httpServer.listen(port);
console.log("Listening on: "+port)
