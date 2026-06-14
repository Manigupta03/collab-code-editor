import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username.trim()) return setError("Enter your name first");
    const id = uuidv4().slice(0, 8);
    navigate(`/editor/${id}`, { state: { username: username.trim() } });
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) return setError("Enter your name");
    if (!roomId.trim()) return setError("Enter a Room ID");
    navigate(`/editor/${roomId.trim()}`, { state: { username: username.trim() } });
  };

  return (
    <div className="home">
      <div className="home-card">
        <div className="logo-area">
          <span className="logo-icon">⌨</span>
          <h1>CollabCode</h1>
          <p>Real-time collaborative code editor</p>
        </div>

        <form onSubmit={joinRoom} className="form">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="e.g. Mani Gupta"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            autoFocus
          />

          <label>Room ID</label>
          <input
            type="text"
            placeholder="Paste room ID to join"
            value={roomId}
            onChange={e => { setRoomId(e.target.value); setError(""); }}
          />

          {error && <p className="error">{error}</p>}

          <div className="btn-row">
            <button type="submit" className="btn btn-primary">Join Room</button>
            <button type="button" className="btn btn-secondary" onClick={createRoom}>
              + New Room
            </button>
          </div>
        </form>

        <p className="hint">
          Create a room and share the URL with teammates to code together in real time.
        </p>
      </div>
    </div>
  );
}
