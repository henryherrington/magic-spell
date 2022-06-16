import React, { useState, useEffect } from 'react';
import './App.css';
import TitleScreen from './TitleScreen';

// for dev
import socketIOClient from "socket.io-client";
import PreGameScreen from './PreGameScreen';
const ENDPOINT = "http://localhost:3001";

function App() {

  const [mySocket, setMySocket] = useState();
  const [roomData, setRoomData] = useState({});
  const [playerData, setPlayerData] = useState({});
  const [inRoom, setInRoom] = useState(false);

  useEffect(() => {
    // const socket = io(); // for prod
    const socket = socketIOClient(ENDPOINT); // for dev
    setMySocket(socket)

    socket.on('player data', function(playerData) {
      setPlayerData(playerData)
    })

    socket.on('room data', function(roomData) {
      setRoomData(roomData)
    })

  }, []);

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
      {inRoom ?
        // "hi"
        <PreGameScreen
          socket={mySocket}
          roomData={roomData}
        >
        </PreGameScreen>
      :
        <TitleScreen
          socket={mySocket}
        ></TitleScreen>
      }
    </div>
  );
}

export default App;
