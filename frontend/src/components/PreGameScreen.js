import React, { useState, useEffect } from 'react';
import './PreGameScreen.css'

function PreGameScreen(props) {

    const [roomCode, setRoomCode] = useState("");
    const [roomPlayers, setRoomPlayers] = useState([]);
    let playerKeyGen = 0

    useEffect(() => {
        if (Object.keys(props.roomData) == 0) return

        setRoomCode(props.roomData["roomCode"])
        console.log(props.roomData)
        setRoomPlayers(Object.keys(props.roomData["playerIds"]))
    }, [props.roomData]);

    function leaveRoom() {
        props.socket.emit("leave room")
    }

  return (
    <div className="pre-game-screen-container">
        <p>Magic Spell</p>
        <p>Room: {roomCode}</p>
        <p>Players:</p>
        <ul>
        {roomPlayers.map((playerId) =>
            <li key={"player" + playerKeyGen++}>{playerId}</li>
        )}
        </ul>
        <button
            onClick={leaveRoom}
        >Leave</button>
    </div>
  );
}

export default PreGameScreen
