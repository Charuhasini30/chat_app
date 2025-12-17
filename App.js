import React, { useEffect, useState } from "react";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [ws, setWs] = useState(null);
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const login = async () => {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.trim(), password: pass.trim() })
    });
    if (res.ok) setPage("chat");
    else alert("Invalid login");
  };

  useEffect(() => {
    if (page !== "chat") return;

    const socket = new WebSocket("ws://localhost:3001");
    socket.onopen = () =>
      socket.send(JSON.stringify({ type: "identify", user }));

    socket.onmessage = (e) =>
      setMessages((m) => [...m, JSON.parse(e.data)]);

    setWs(socket);
  }, [page, user]);

  const send = () => {
    if (!text || !selected) return;
    ws.send(JSON.stringify({ from: user, to: selected, text }));
    setText("");
  };

  /* ---------------- LOGIN ---------------- */
  if (page === "login") {
    return (
      <div style={styles.loginBg}>
        <div style={styles.loginCard}>
          <h2 style={{ color: "#075e54" }}>WhatsChat</h2>

          <input
            style={styles.input}
            placeholder="Username"
            onChange={e => setUser(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            onChange={e => setPass(e.target.value)}
          />

          <button style={styles.loginBtn} onClick={login}>
            Login
          </button>

          <p style={{ fontSize: 12, color: "#666" }}>
            Use: <b>user1 / user2</b> (password: 123)
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- CHAT ---------------- */
  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.profile}>{user}</div>

        {["user1", "user2"].map(u => (
          <div
            key={u}
            style={selected === u ? styles.contactActive : styles.contact}
            onClick={() => setSelected(u)}
          >
            <div style={styles.avatar}>{u[0].toUpperCase()}</div>
            <div>{u}</div>
          </div>
        ))}
      </aside>

      {/* Chat Area */}
      <main style={styles.chat}>
        <div style={styles.chatHeader}>
          {selected || "Select a chat"}
        </div>

        <div style={styles.messages}>
          {messages
            .filter(
              m =>
                (m.from === user && m.to === selected) ||
                (m.from === selected && m.to === user)
            )
            .map((m, i) => (
              <div
                key={i}
                style={m.from === user ? styles.msgRight : styles.msgLeft}
              >
                <div>{m.text}</div>
                <div style={styles.msgTime}>
                  {new Date(m.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            ))}
        </div>

        {selected && (
          <div style={styles.inputBar}>
            <input
              style={styles.msgInput}
              placeholder="Type a message"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button style={styles.sendBtn} onClick={send}>
              ➤
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  loginBg: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#128c7e,#25d366)"
  },
  loginCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 10,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "center"
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  loginBtn: {
    background: "#25d366",
    border: "none",
    padding: 10,
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold"
  },
  app: { display: "flex", height: "100vh", fontFamily: "Segoe UI" },
  sidebar: {
    width: 260,
    background: "#f0f2f5",
    borderRight: "1px solid #ddd"
  },
  profile: {
    padding: 16,
    background: "#075e54",
    color: "#fff",
    fontWeight: "bold"
  },
  contact: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    cursor: "pointer"
  },
  contactActive: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "#e9edef",
    fontWeight: "bold"
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#25d366",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold"
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#efeae2"
  },
  chatHeader: {
    padding: 16,
    background: "#075e54",
    color: "#fff",
    fontWeight: "bold"
  },
  messages: {
    flex: 1,
    padding: 20,
    overflowY: "auto"
  },
  msgLeft: {
    background: "#fff",
    padding: "8px 12px",
    borderRadius: "8px 8px 8px 0",
    marginBottom: 10,
    maxWidth: "60%"
  },
  msgRight: {
    background: "#d9fdd3",
    padding: "8px 12px",
    borderRadius: "8px 8px 0 8px",
    marginBottom: 10,
    maxWidth: "60%",
    marginLeft: "auto"
  },
  msgTime: {
    fontSize: 11,
    textAlign: "right",
    color: "#555",
    marginTop: 2
  },
  inputBar: {
    display: "flex",
    padding: 10,
    background: "#f0f2f5",
    alignItems: "center",
    gap: 10
  },
  msgInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 20,
    border: "1px solid #ccc",
    outline: "none"
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "#25d366",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16
  }
};
