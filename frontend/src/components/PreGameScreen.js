import React, { useState, useEffect } from 'react';
import LobbyPlayerCard from './LobbyPlayerCard';
import './PreGameScreen.css'

function PreGameScreen(props) {

    const [roomCode, setRoomCode] = useState("");
    const [roomPlayers, setRoomPlayers] = useState([]);
    let playerKeyGen = 0

    useEffect(() => {
        setRoomCode(props.roomData["roomCode"])
    }, [props.roomData]);

    useEffect(() => {
        setRoomPlayers(props.playersData)
    }, [props.playersData]);

    function leaveRoom() {
        props.socket.emit("leave room")
    }

    function startGame() {
        props.socket.emit("start game")
    }

  return (
    <div className="pre-game-screen-container">
        <p>{roomCode}</p>
        <div className="pre-game-players-container">
            {roomPlayers.map((playerData) =>
                <LobbyPlayerCard
                    key={"lobby-player-card" + playerKeyGen++}
                    playerData={playerData}
                ></LobbyPlayerCard>
            )}
        </div>
        <button
            onClick={leaveRoom}
        >Leave</button>
        <button
            onClick={startGame}
        >Start</button>
    </div>
  );
}

export default PreGameScreen
