CollabCode — Real-Time Collaborative Code Editor
A full-stack real-time collaborative code editor where multiple users can write, sync, and execute code together in shared rooms — built with React, Node.js, Socket.io, Monaco Editor, and Judge0.
🔗 Live Demo
App: https://collab-code-editor-psi.vercel.app

Backend API: https://collab-code-editor-mvie.onrender.com

⚠️ Note: The backend runs on Render's free tier, which "sleeps" after periods of inactivity. The first request after idle time may take 20–50 seconds to respond while the server wakes up.


🚀 How to Use

Open the live demo link above
Enter your name → click + New Room (or paste a Room ID to join an existing one)
Share the URL with others — everyone in the room sees live code changes instantly
Pick a language from the dropdown (8 supported)
Click ▶ Run to execute code via Judge0 and see output (stdout/stderr/compile errors)


🛠 Tech Stack
LayerTechFrontendReact, Monaco Editor, React RouterRealtimeSocket.io (client + server)BackendNode.js, ExpressExecutionJudge0 CE API (REST)HostingVercel (frontend), Render (backend)StylingCustom CSS

💡 Features

Real-time multi-user code sync via Socket.io
Room-based collaboration with shareable URLs
Monaco Editor (same engine as VS Code)
8 language support: JavaScript, Python, C++, C, Java, Go, Rust, TypeScript
Live code execution via Judge0 API with colored output
Live user presence list with color-coded indicators
Join/leave notifications
Synced language switching across all users in a room


📁 Project Structure
collab-editor/

├── server/

│   ├── index.js          ← Express + Socket.io server, Judge0 integration

│   └── package.json

│

└── client/

├── public/

│   └── index.html

└── src/

├── App.js                  ← Routing

├── App.css                 ← Styles

├── index.js                ← Entry point

├── context/

│   └── SocketContext.jsx   ← Socket.io connection (points to Render backend)

├── pages/

│   ├── Home.jsx            ← Landing / join page

│   └── EditorPage.jsx      ← Main editor page

└── components/

├── UsersList.jsx       ← Live presence sidebar

└── OutputPanel.jsx     ← Code execution output panel

🖥 Running Locally
If you want to run this project on your own machine instead of using the live demo:
Prerequisites

Node.js (v18+): https://nodejs.org → download LTS
VS Code: https://code.visualstudio.com (recommended)

1. Clone the repo
git clone https://github.com/Manigupta03/collab-code-editor.git

cd collab-code-editor
2. Run the server
cd server

npm install

node index.js
You should see: Server running on port 5000
3. Run the client
Open a second terminal:

cd client

npm install

npm start
Browser opens at http://localhost:3000
⚠️ Important — switch URLs back to localhost
The client code currently points to the deployed Render backend (https://collab-code-editor-mvie.onrender.com). To run fully locally, change these two files back to http://localhost:5000:

client/src/context/SocketContext.jsx
client/src/pages/EditorPage.jsx


🌐 Deployment
This project is deployed as two separate services:

Frontend (client/) → deployed on Vercel
Backend (server/) → deployed on Render as a Web Service (Root Directory: server, Build: npm install, Start: node index.js)

Any push to the main branch on GitHub automatically triggers a redeploy on both platforms.

🔧 Troubleshooting
Backend not responding / sync not working?

The Render free-tier server sleeps after inactivity — wait ~30 seconds on first load and try again.
Port already in use (local)?

npx kill-port 5000
npm install fails?

npm install --legacy-peer-deps
Monaco editor blank?

Hard refresh the browser: Ctrl + Shift + R

