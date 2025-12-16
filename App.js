import React, { useEffect, useRef, useState } from "react";

function App() {
  const [ws, setWs] = useState(null);
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setChat(prev => [...prev, msg]);
    };

    setWs(socket);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (ws && user.trim() && message.trim()) {
      ws.send(JSON.stringify({ user, message }));
      setMessage("");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <h3 style={styles.title}>Live Chat Timeline</h3>

        <div style={styles.timeline}>
          {chat.map((c, i) => (
            <div key={i} style={styles.entry}>
              <div style={styles.user}>{c.user}</div>
              <div style={styles.text}>{c.message}</div>
              <div style={styles.separator}></div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={styles.controls}>
          <input
            style={styles.input}
            placeholder="Your name"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Write message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button style={styles.button} onClick={sendMessage}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fafafa"
  },
  panel: {
    width: "420px",
    height: "620px",
    border: "1px solid #000",
    display: "flex",
    flexDirection: "column",
    fontFamily: "monospace"
  },
  title: {
    padding: "10px",
    borderBottom: "1px solid #000",
    margin: 0,
    textAlign: "center"
  },
  timeline: {
    flex: 1,
    padding: "12px",
    overflowY: "auto"
  },
  entry: {
    marginBottom: "10px"
  },
  user: {
    fontWeight: "bold"
  },
  text: {
    marginLeft: "10px"
  },
  separator: {
    marginTop: "6px",
    borderBottom: "1px dashed #000"
  },
  controls: {
    borderTop: "1px solid #000",
    padding: "8px",
    display: "flex",
    gap: "5px"
  },
  input: {
    flex: 1,
    padding: "6px",
    border: "1px solid #000",
    fontFamily: "monospace"
  },
  button: {
    padding: "6px 10px",
    border: "1px solid #000",
    background: "#fff",
    cursor: "pointer"
  }
};

export default App;
