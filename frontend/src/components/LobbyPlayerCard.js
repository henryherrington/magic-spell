import './LobbyPlayerCard.css';

function LobbyPlayerCard(props) {
    return (
        <div className="lobby-player-card-container">
            <img className="lobby-avatar" src={"./avatars/avatar-" + props.playerData["avatar"] + ".png"}></img>
            <p>{props.playerData["username"]}</p>
        </div>
    )
}

export default LobbyPlayerCard