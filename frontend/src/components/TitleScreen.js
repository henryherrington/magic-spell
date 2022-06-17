import { useState } from 'react';
import LobbyPlayerCard from './LobbyPlayerCard';
import './TitleScreen.css'

function TitleScreen(props) {

  const [roomCode, setRoomCode] = useState('');

  function createRoom() {
    console.log("creating room")
    props.socket.emit("create room")
  }

  function joinRoom() {
    console.log("joining room")
    props.socket.emit("join room", roomCode)
  }

  return (
    <div className="title-screen-container">
        <LobbyPlayerCard
          playerData={props.playerData}
        ></LobbyPlayerCard>
        <button
          onClick={createRoom}
        >New Room</button><br></br>

        <input
          type="text"
          size="6"
          style={{textTransform: "uppercase"}}
          maxLength="4" 
          value={roomCode}
          onInput={e => (setRoomCode(e.target.value))}
          autoComplete="off"
        ></input>
        <button
          onClick={joinRoom}
        >Join Room</button>
    </div>
  );
}

export default TitleScreen
