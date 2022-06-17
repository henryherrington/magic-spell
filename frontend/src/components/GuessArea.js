import React, { useState, useEffect } from 'react';
import './GuessArea.css'

function GuessArea(props) {

    const A_KEYCODE = 65
    const Z_KEYCODE = 90
    const BACKSPACE_KEYCODE = 8
    const MAX_GUESS_LENGTH = 9

    const [guess, setGuess] = useState("");
    
    React.useEffect(() => {

        const handleKeyDown = (event) => {
            // only accept alphabetic keys and delete
            if (event.keyCode >= A_KEYCODE && event.keyCode <= Z_KEYCODE) {
                if (guess.length < MAX_GUESS_LENGTH) {
                    setGuess(guess + event.key)
                }
            }
            else if (event.keyCode == BACKSPACE_KEYCODE) {
                setGuess(guess.slice(0, guess.length -1))
            }
        };

        window.addEventListener('keydown', handleKeyDown);
    
        // cleanup this component
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [guess]);

    return (
        <div className="guess-area-container">
         guess: {guess}
        </div>
    );
}

export default GuessArea
