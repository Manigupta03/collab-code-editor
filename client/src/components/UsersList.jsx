export default function UsersList({ users, currentSocketId }) {
  const list = Object.entries(users);
  return (
    <div className="users-panel">
      <h3>Users — {list.length}</h3>
      <ul>
        {list.map(([id, { username, color }]) => (
          <li key={id} className="user-item">
            <span className="user-dot" style={{ background: color }} />
            <span className="user-name">
              {username}
              {id === currentSocketId && <em> (you)</em>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
