# CollabCode — Real-Time Collaborative Code Editor

A full-stack project for your resume. Built with React, Node.js, Socket.io, Monaco Editor, and Judge0 API.

---

## ⚡ Quick Setup (one time)

### Prerequisites
Install these if you don't have them:
- **Node.js** (v18+): https://nodejs.org → download LTS
- **VS Code**: https://code.visualstudio.com (recommended)

### Step 1 — Clone / Open the project
If you're reading this, you already have the files.
Open the `collab-editor` folder in VS Code.

---

### Step 2 — Install & run the Server

Open a terminal in VS Code (`Ctrl + ~`) and run:

```bash
cd server
npm install
node index.js
```

You should see:
```
Server running on port 5000
```

---

### Step 3 — Install & run the Client

Open a **second terminal** (`Ctrl + ~`, then click the + icon) and run:

```bash
cd client
npm install
npm start
```

Browser opens automatically at **http://localhost:3000**

---

## 🚀 Using the App

1. Enter your name → click **+ New Room**
2. Copy the Room ID or Share Link
3. Open another tab / browser, paste the Room ID → Join Room
4. Both editors sync in real time!
5. Pick a language, write code, click **▶ Run**

---

## 🔑 Enable Code Execution (Judge0)

Code execution uses the free Judge0 public API.

**For better reliability**, get a free RapidAPI key:
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up free → click "Subscribe to Test"
3. Copy your API key
4. In the `server/` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Paste your key in `.env`:
   ```
   RAPIDAPI_KEY=your_actual_key_here
   ```
6. Restart the server (`Ctrl+C`, then `node index.js`)

---

## 📁 Project Structure

```
collab-editor/
├── server/
│   ├── index.js          ← Express + Socket.io server
│   ├── package.json
│   └── .env.example      ← Copy to .env and add your key
│
└── client/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            ← Routing
        ├── App.css           ← All styles
        ├── index.js          ← Entry point
        ├── context/
        │   └── SocketContext.jsx   ← Socket.io global connection
        ├── pages/
        │   ├── Home.jsx            ← Landing / join page
        │   └── EditorPage.jsx      ← Main editor page
        └── components/
            ├── UsersList.jsx       ← Sidebar user list
            └── OutputPanel.jsx     ← Code execution output
```

---

## 🛠 Tech Stack (for your resume)

| Layer    | Tech |
|----------|------|
| Frontend | React, Monaco Editor, React Router |
| Realtime | Socket.io (client + server) |
| Backend  | Node.js, Express |
| Execution| Judge0 API (REST) |
| Styling  | Custom CSS |

---

## 💡 Features

- ✅ Real-time multi-user code sync via Socket.io
- ✅ Room-based collaboration (shareable URL)
- ✅ Monaco Editor (same as VS Code)
- ✅ 8 language support (JS, Python, C++, C, Java, Go, Rust, TypeScript)
- ✅ Code execution via Judge0 API
- ✅ Live user list with color indicators
- ✅ Join/leave notifications
- ✅ Language switching syncs across all users
- ✅ Colored output (stdout/stderr/compile errors)

---

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**npm install fails?**
```bash
npm install --legacy-peer-deps
```

**Monaco editor blank?**
Hard refresh the browser: `Ctrl + Shift + R`
