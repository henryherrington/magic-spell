const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 3001;
const app = express();


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})