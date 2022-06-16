import React, { useState, useEffect } from 'react';
import './App.css';
import TitlePage from './TitlePage';

// for dev
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3001";

function App() {

  const [mySocket, setMySocket] = useState();

  useEffect(() => {
    // const socket = io(); // for prod
    const socket = socketIOClient(ENDPOINT); // for dev
    setMySocket(socket)

    socket.on('lobby players', function(players) {
      // xyz
    })

  }, []);

  return (
    <div className="app-container">
        <TitlePage
          socket={mySocket}
        ></TitlePage>
    </div>
  );
}

export default App;
