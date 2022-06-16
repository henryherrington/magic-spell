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
    createRoom();
  })

  // removes the disconnected player from their room
  // then removes the disconnected player from player list
  socket.on('disconnect', () => {
    console.log("disconnected: " + socket.id)
    leaveRoom()
    delete players[socket.id]
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
  // player who creates room is automatically added
  // returns the new room's room code
  function createRoom() {

    // if the player creating this room is already in a room,
    // leave that room first
    leaveRoom()

    // create new room with room creator in it
    let newRoomCode = genRoomCode()
    let playerIds = new Set()
    playerIds.add(socket.id)
    let newRoom = {
      id: newRoomCode,
      playerIds: playerIds
    }
    rooms[newRoomCode] = newRoom

    // add room to creator's player object
    players[socket.id]["roomCode"] = newRoomCode


    // console.log('room created: ' + newRoomCode)
    console.log(rooms)
    return newRoomCode
  }

  // removes the calling player from their room, if any.
  // properly destroys the room if necessary.
  function leaveRoom() {
      if (players[socket.id]["roomCode"] == "") return

      let roomCode = players[socket.id]["roomCode"]
      rooms[roomCode]["playerIds"].delete(socket.id)

      if (rooms[roomCode]["playerIds"].size == 0) {
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