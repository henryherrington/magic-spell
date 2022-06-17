const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 3001;
const app = express();

const ROUND_TIMER_SECONDS = 3
const RECAP_TIMER_SECONDS = 2
const NUM_ROUNDS = 4.5
const GAME_LETTERS_VOWEL_COUNT = 3
const GAME_LETTERS_CONS_COUNT = 4
const GAME_LETTERS_RAND_COUNT = 2
const MAX_GUESS_LENGTH = 9


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
  createPlayer()
  updateView()

  socket.on('create room', () => {
    let roomCode = createRoom()
    joinRoom(roomCode)
  })

  socket.on('join room', (roomCode) => {
    joinRoom(roomCode)
  })

  socket.on('leave room', () => {
    leaveRoom()
  })

  socket.on('start game', () => {
    startGame()
  })

  socket.on('add guess letter', (guess) => {
    addGuessLetter(guess)
  })

  socket.on('remove guess letter', () => {
    removeGuessLetter()
  })


  // removes the disconnected player from their room
  // then removes the disconnected player from player list
  socket.on('disconnect', () => {
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
        "roomCode"  : "",
        "guess"     : ""
    }
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
      "roomCode": newRoomCode,
      "playerIds": playerIds,
      "round": 0.5,
      "gameOver": false,
      "letterBank": ""
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

    // update view
    updateView()
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

      // update view w/ old room if old room still exists
      if (Object.keys(rooms[roomCode]["playerIds"]).length == 0) {
        delete rooms[roomCode]
        updateView()
      }
      else {
        updateView(roomCode)
      }
  }

  function startGame() {
    let roomCode = players[socket.id]["roomCode"]
    advanceRound(roomCode)
  }

  function advanceRound(roomCode) {
    // do nothing if all players have left/disconnected and room no longer exists
    if (!(roomCode in rooms)) return
    
    let oldRound = rooms[roomCode]["round"]
    let newRound = oldRound + .5
    if (newRound == NUM_ROUNDS) {
      rooms[roomCode]["gameOver"] = true
    }
    
    console.log("starting round " + newRound)

    // update round, letters, player words, (and score)
    rooms[roomCode]["round"] = newRound

    let isRecap = (newRound * 2) % 2 != 0
    let roundTime

    if (!isRecap) {
        clearRoomGuesses(roomCode)
        rooms[roomCode]["letterBank"] = generateGameLetters()
        roundTime = ROUND_TIMER_SECONDS
    }
    else {
        roundTime = RECAP_TIMER_SECONDS
    }

    rooms[roomCode]["roundTimer"] = roundTime

    // update view
    updateView()

    // don't start round timer if game is over
    if (rooms[roomCode]["gameOver"]) return

    setTimeout(() => {
        advanceRound(roomCode)
      }, roundTime * 1000)
  }

  // resets all player guesses to emptystring within a room
  function clearRoomGuesses(roomCode) {
    roomPlayers = rooms[roomCode]["playerIds"]

    for (const player of Object.keys(roomPlayers)) {
      players[player]["guess"] = ""
    }
  }

  // updates the view for the current socket as well as desired room
  // if desired room is empty, broadcasts to socket's curr room
  // can be called even if client disconnected
  function updateView(roomCode) {
    let socketDisconnected = !(socket.id in players)

    // if disconnect, update past room
    if (socketDisconnected) {
      console.log("socket disconnected")
      if (!roomCode) return
      io.to(roomCode).emit('room data', getRoomWithPlayers(roomCode))
    }
    else {
      // if client is still here, always update their view
      io.to(socket.id).emit('player data', players[socket.id])

      // if left, update for current client and past room
      // if hasn't left, update current client and current room
      if (!roomCode) {
        roomCode = players[socket.id]["roomCode"]
        if (roomCode == "") return
      }
      io.to(roomCode).emit('room data', getRoomWithPlayers(roomCode)) 
    }
  }

  // compile players data, which is the player object
  // in the future, censor data before sending it to individuals
  function getRoomWithPlayers(roomCode) {
      let roomPlayers = []
      for (let playerId of Object.keys(rooms[roomCode]["playerIds"])) {
        playerClone = {...players[playerId]}

        // censor if non-recap round
        if (roomInGameRound(roomCode)) {
          console.log("sending censored")
          playerGuessLen = playerClone["guess"].length
          playerClone["guess"] = new Array(playerGuessLen + 1).join("*")  
        }

    
        roomPlayers.push(playerClone)
      }

      roomDataClone = JSON.parse(JSON.stringify(rooms[roomCode]));
      roomDataClone["players"] = roomPlayers
      delete roomDataClone["playerIds"]
      return roomDataClone
  }

  // adds given letter to this player object's guess
  function addGuessLetter(guessLetter) {
    // can't alter guess in recap round
    if (!playerInGameRound()) return

    let oldGuess = players[socket.id]["guess"]
    if (oldGuess.length < MAX_GUESS_LENGTH) {
      players[socket.id]["guess"] = oldGuess + guessLetter
      updateView()
    }
  }

   // removes letter from this player object's guess
   function removeGuessLetter() {
    // can't alter guess in recap round
    if (!playerInGameRound()) return

    let oldGuess = players[socket.id]["guess"]
    players[socket.id]["guess"] = oldGuess.slice(0, -1)
    updateView()
  }

  function playerInGameRound() {
    if (players[socket.id]["roomCode"] == "") return false
    return roomInGameRound(players[socket.id]["roomCode"])
  }

  function roomInGameRound(roomCode) {
    if (!(roomCode in rooms)) return false
    let currRound = rooms[roomCode]["round"]
    return (currRound * 2) % 2 == 0
  }

});

function genRoomCode() {
  let code = ""
  const roomCodeLen = 4
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  for (var i = 0; i < roomCodeLen; i++) {
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return code;
}

function generateGameLetters() {
  const vowels = "AEIOU"
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ"
  const alphabet = vowels + consonants
  
  let letters = ""

  // must be vowels
  for (var i = 0; i < GAME_LETTERS_VOWEL_COUNT; i++) {
    letters += vowels.charAt(Math.floor(Math.random() * vowels.length));
  }

  // must be consonants
  for (var i = 0; i < GAME_LETTERS_CONS_COUNT; i++) {
    letters += consonants.charAt(Math.floor(Math.random() * consonants.length));
  }

  // must be random
  for (var i = 0; i < GAME_LETTERS_RAND_COUNT; i++) {
    letters += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return letters
}

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})