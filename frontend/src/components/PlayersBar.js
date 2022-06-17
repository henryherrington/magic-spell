import React, { useState, useEffect } from 'react';
import './PlayersBar.css'

import PlayersBarCard from './PlayersBarCard';

function PlayersBar(props) {

    // const [players, setPlayers] = useState([]);

    // useEffect(() => {
    //     if (Object.keys(props.roomData) == 0) return
    //     setIsFinalRecap(props.roomData["round"] == 5)
    //     setRound(props.roomData["round"])
    // }, [props.roomData]);

    // function leaveRoom() {
    //     props.socket.emit("leave room")
    // }

    let playerKeyGen = 0

    return (
        <div className="players-bar-container">
            <p>Players Bar</p>
            {props.playersData.map((playerData) =>
                <PlayersBarCard
                    key={"players-bar-card" + playerKeyGen++}
                    playerData={playerData}
                ></PlayersBarCard>
            )}
        </div>
    );
}

export default PlayersBar
