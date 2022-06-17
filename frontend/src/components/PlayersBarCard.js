import './PlayersBarCard.css';

function PlayersBarCard(props) {
    return (
        <div className="players-bar-card-container">
            <img className="players-bar-card-avatar" src={"./avatars/avatar-" + props.playerData["avatar"] + ".png"}></img>
            <p>{props.playerData["username"]}</p>
        </div>
    )
}

export default PlayersBarCard