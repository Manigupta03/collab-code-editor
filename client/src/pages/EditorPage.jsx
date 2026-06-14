import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import UsersList from "../components/UsersList";
import OutputPanel from "../components/OutputPanel";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python",     label: "Python" },
  { value: "cpp",        label: "C++" },
  { value: "c",          label: "C" },
  { value: "java",       label: "Java" },
  { value: "go",         label: "Go" },
  { value: "rust",       label: "Rust" },
  { value: "typescript", label: "TypeScript" },
];

const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, World!");\n`,
  python:     `# Python\nprint("Hello, World!")\n`,
  cpp:        `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
  c:          `#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
  java:       `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
  go:         `package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n`,
  rust:       `fn main() {\n    println!("Hello, World!");\n}\n`,
  typescript: `const greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("World"));\n`,
};

export default function EditorPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const username = location.state?.username;

  const [code, setCode] = useState("// Loading...\n");
  const [language, setLanguage] = useState("javascript");
  const [users, setUsers] = useState({});
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showOutput, setShowOutput] = useState(false);

  const mySocketId = socket?.id;
  const isRemoteUpdate = useRef(false);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // Guard: redirect if no username
  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  useEffect(() => {
    if (!socket || !username) return;

    socket.emit("join-room", { roomId, username });

    socket.on("room-state", ({ code, language, users }) => {
      setCode(code);
      setLanguage(language);
      setUsers(users);
    });

    socket.on("user-joined", ({ username: name, users }) => {
      setUsers(users);
      addToast(`${name} joined`);
    });

    socket.on("user-left", ({ username: name, users }) => {
      setUsers(users);
      addToast(`${name} left`);
    });

    socket.on("code-update", ({ code }) => {
      isRemoteUpdate.current = true;
      setCode(code);
    });

    socket.on("language-update", ({ language }) => {
      setLanguage(language);
    });

    return () => {
      socket.off("room-state");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("code-update");
      socket.off("language-update");
    };
  }, [socket, roomId, username, addToast]);

  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    setCode(value);
    socket?.emit("code-change", { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const newCode = DEFAULT_CODE[lang] || "";
    setCode(newCode);
    socket?.emit("language-change", { roomId, language: lang });
    socket?.emit("code-change", { roomId, code: newCode });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const { data } = await axios.post("https://collab-code-editor-mvie.onrender.com/api/execute", { code, language });
      setOutput(data);
    } catch {
      setOutput({ stderr: "Could not reach execution server.", stdout: "", compile_output: "" });
    } finally {
      setIsRunning(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied!");
  };

  if (!username) return null;

  return (
    <div className="editor-page">
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-sm">⌨ CollabCode</span>
          <div className="room-badge" onClick={copyRoomId} title="Click to copy Room ID">
            <span className="room-label">Room:</span>
            <span className="room-id">{roomId}</span>
            <span className="copy-hint">{copied ? "✓" : "⎘"}</span>
          </div>
        </div>

        <div className="topbar-center">
          <select className="lang-select" value={language} onChange={handleLanguageChange}>
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={copyLink}>Share Link</button>
          <button className="btn btn-run" onClick={runCode} disabled={isRunning}>
            {isRunning ? "⏳ Running…" : "▶ Run"}
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="editor-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <UsersList users={users} currentSocketId={mySocketId} />
          <div className="sidebar-footer">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>← Leave</button>
          </div>
        </aside>

        {/* Editor + Output */}
        <main className="editor-main">
          <div className={`editor-container ${showOutput ? "with-output" : ""}`}>
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                renderWhitespace: "selection",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                tabSize: 2,
              }}
            />
          </div>

          {showOutput && (
            <div className="output-container">
              <button className="close-output" onClick={() => setShowOutput(false)}>✕</button>
              <OutputPanel output={output} isRunning={isRunning} />
            </div>
          )}

          {!showOutput && output && (
            <button className="show-output-btn" onClick={() => setShowOutput(true)}>
              Show Output ↑
            </button>
          )}
        </main>
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
