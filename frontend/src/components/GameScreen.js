import React, { useState, useEffect } from 'react';
import './GameScreen.css'
import PlayersBar from './PlayersBar';
import GuessArea from './GuessArea';

function GameScreen(props) {

    const [round, setRound] = useState(0.5);
    const [letterBank, setLetterBank] = useState("x");
    const [isFinalRecap, setIsFinalRecap] = useState(false);

    useEffect(() => {
        if (Object.keys(props.roomData) == 0) return
        setIsFinalRecap(props.roomData["round"] == 5)
        setRound(props.roomData["round"])
        setLetterBank(props.roomData["letterBank"])
    }, [props.roomData]);

    function leaveRoom() {
        props.socket.emit("leave room")
    }

    return (
        <div className="game-screen-container">
            <PlayersBar
                playersData={props.playersData}
            ></PlayersBar>
            <div className="game-screen-main">
            <GuessArea>

            </GuessArea>
                <p>Letters: {letterBank}</p>
                <p>Round: {round}</p>
                {isFinalRecap ?
                    <button onClick={leaveRoom}>Leave</button>
                : ""}
            </div>
        </div>
    );
}

export default GameScreen
