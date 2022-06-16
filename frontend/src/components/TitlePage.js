import './TitlePage.css';

function TitlePage(props) {

  function createRoom() {
    console.log("creating room")
    props.socket.emit("create room")
  }

  return (
    <div className="title-page-container">
        <p>Magic Spell</p>
        <button onClick={createRoom}>New Room</button><br></br>
        <button>Join Room</button>
    </div>
  );
}

export default TitlePage;
