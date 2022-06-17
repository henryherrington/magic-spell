import React, { useState, useEffect } from 'react';
import './GuessArea.css'

function GuessArea(props) {

    const A_KEYCODE = 65
    const Z_KEYCODE = 90
    const BACKSPACE_KEYCODE = 8
    const MAX_GUESS_LENGTH = 5


    // on keypress, send pressed key to server
    // *** fix to only send if in a valid round... (backend check already exists)
    const handleKeyDown = (event) => {
        // only accept alphabetic keys and delete
        if (event.keyCode >= A_KEYCODE && event.keyCode <= Z_KEYCODE) {
            if (props.guess.length < MAX_GUESS_LENGTH) {
                props.socket.emit("add guess letter", event.key)
            }
        }
        else if (event.keyCode == BACKSPACE_KEYCODE) {
            props.socket.emit("remove guess letter")
        }
    };

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="guess-area-container">
         guess: {props.guess}
        </div>
    );
}

export default GuessArea
