// Client: chat UI + live preview. Sends full history to /api/chat, renders replies,
// and updates the preview iframe when the agent returns a `preview` HTML document.

const messagesEl = document.getElementById("messages");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const previewEl = document.getElementById("preview");
const previewEmpty = document.getElementById("previewEmpty");
const modeEl = document.getElementById("mode");

const history = [];

function addMessage(role, text, opts = {}) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + role + (opts.typing ? " typing" : "");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return wrap;
}

function setPreview(html) {
  previewEl.srcdoc = html;
  previewEmpty.classList.add("hidden");
}

async function health() {
  try {
    const r = await fetch("/api/health");
    const j = await r.json();
    modeEl.textContent = j.mode === "live" ? "live • Claude" : "demo mode";
    modeEl.classList.toggle("demo", j.mode !== "live");
  } catch {
    modeEl.textContent = "offline";
  }
}

async function send(text) {
  addMessage("user", text);
  history.push({ role: "user", content: text });
  input.value = "";
  sendBtn.disabled = true;
  const typing = addMessage("assistant", "thinking…", { typing: true });

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const j = await r.json();
    typing.remove();
    const reply = j.reply || "(no response)";
    addMessage("assistant", reply);
    history.push({ role: "assistant", content: reply });
    if (j.preview) setPreview(j.preview);
  } catch (err) {
    typing.remove();
    addMessage("assistant", "Error reaching the server: " + err);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) send(text);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

health();
