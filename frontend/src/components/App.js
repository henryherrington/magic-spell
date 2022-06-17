import React, { useState, useEffect } from 'react';
import './App.css';
import TitleScreen from './TitleScreen';
import PreGameScreen from './PreGameScreen';
import GameScreen from './GameScreen';

// for dev
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3001";

function App() {

  const [mySocket, setMySocket] = useState();
  const [roomData, setRoomData] = useState({});
  const [playerData, setPlayerData] = useState({});
  const [playersData, setPlayersData] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [inPreGame, setInPreGame] = useState(true);

  useEffect(() => {
    console.log("players")
    console.log(roomData)
    console.log(playerData)
    // const socket = io(); // for prod
    const socket = socketIOClient(ENDPOINT); // for dev
    setMySocket(socket)

    socket.on('player data', function(playerData) {
      setPlayerData(playerData)
    })

    socket.on('room data', function(roomData) {
      setRoomData(roomData)
      setPlayersData(roomData["players"])
    })

  }, []);

  useEffect(() => {
    setInPreGame(roomData["round"] == 0.5)
  }, [roomData]);

  useEffect(() => {
    if (Object.keys(playerData).length == 0) {
      setInRoom(false)
    }
    else {
      setInRoom(playerData["roomCode"] != "")
    }
  }, [playerData]);


  return (
    <div className="app-container">
      <p>Magic Spell</p>
      {inRoom ?
        (inPreGame ?
          <PreGameScreen
            socket={mySocket}
            roomData={roomData}
            playersData={playersData}
          ></PreGameScreen>
        :
          <GameScreen
            socket={mySocket}
            roomData={roomData}
            playersData={playersData}
            playerData={playerData}
          ></GameScreen>  
        )
      :
        <TitleScreen
          socket={mySocket}
          playerData={playerData}
        ></TitleScreen>
      }
    </div>
  );
}

export default App;
