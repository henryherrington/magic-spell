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


let players = {}
let rooms = {}
let usernameGen = 0

io.on('connection', (socket) => {
  console.log('a user connected')

  createPlayer()

  socket.on('create room', () => {
    let roomCode = createRoom()
    joinRoom(roomCode)
    console.log()
    io.to(socket.id).emit('player data', players[socket.id])
    io.to(roomCode).emit('room data', rooms[roomCode])
  })

  socket.on('join room', (roomCode) => {
    joinRoom(roomCode)
    console.log("joining room " + roomCode)
    io.to(socket.id).emit('player data', players[socket.id])
    io.to(roomCode).emit('room data', rooms[roomCode])
  })

  socket.on('leave room', () => {
    let roomCode = players[socket.id]["roomCode"]
    leaveRoom()
    io.to(socket.id).emit('player data', players[socket.id])
    io.to(roomCode).emit('room data', rooms[roomCode])
    console.log(socket.id + " left room " + roomCode)
  })


  // removes the disconnected player from their room
  // then removes the disconnected player from player list
  socket.on('disconnect', () => {
    console.log("disconnecting: " + socket.id)
    let roomCode = players[socket.id]["roomCode"]
    leaveRoom()
    delete players[socket.id]
    console.log("disconnected: " + socket.id)
    io.to(roomCode).emit('room data', rooms[roomCode])
  })

  // creates a player object for the socket calling this
  // function.
  function createPlayer() {
    players[socket.id] = {
        "id"        : socket.id,
        "username"  : "Guest" + usernameGen++,
        "avatar"    : "blank",
        "roomCode"    : ""
    }
    console.log("players:")
    console.log(players)
  }

  // creates a room and adds it to rooms dict
  // returns room code
  function createRoom() {

    // create new room with room creator in it
    let newRoomCode = genRoomCode()
    // using dict for playerIds b/c can't set Sets over
    // socket.io. Dicts are next easiest for quick removal
    let playerIds = {} 
    let newRoom = {
      roomCode: newRoomCode,
      playerIds: playerIds
    }
    rooms[newRoomCode] = newRoom

    return newRoomCode
  }

  // adds calling socket to room, both the socket.io room
  // and the room object. Also adds roomCode to player object
  function joinRoom(roomCode) {
    // if room doesn't exist, do nothing
    if (!(roomCode in rooms)) return

    // if the player joining this room is already in a room,
    // leave that room first
    leaveRoom()

    // join socket.io room
    socket.join(roomCode);

    // join server room object
    rooms[roomCode]["playerIds"][socket.id] = true

    // add room to creator's player object
    players[socket.id]["roomCode"] = roomCode

    console.log("joined room:")
    console.log(rooms[roomCode])
  }

  // removes the calling player from their room, if any.
  // removes from both the socket.io room and server objects.
  // properly destroys the room if necessary.
  function leaveRoom() {
      let roomCode = players[socket.id]["roomCode"]
      if (roomCode == "") return

      // remove server objects
      delete rooms[roomCode]["playerIds"][socket.id]
      players[socket.id]["roomCode"] = ""

      // leave socket.io room
      socket.leave(roomCode);

      if (Object.keys(rooms[roomCode]["playerIds"]).length == 0) {
        delete rooms[roomCode]
      }
  }

});

function genRoomCode() {
  let code = ""
  const codeLen = 4
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  for (var i = 0; i < codeLen; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return code;
}

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})