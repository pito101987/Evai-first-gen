const messagesEl = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

// Maintain a simple userId in localStorage
const userId = localStorage.getItem("evai_user_id") || (() => {
  const id = "user_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("evai_user_id", id);
  return id;
})();

function addMessage(text, who = "bot") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

addMessage("Hi, I'm EVAI. Tell me how you're feeling or what you're working on. 💬", "bot");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMessage(text, "user");
  addMessage("Thinking…", "bot");
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message: text })
    });
    const data = await res.json();
    // Replace last "Thinking…" bubble
    messagesEl.lastChild.textContent = data.reply || "I'm here.";
  } catch (e) {
    messagesEl.lastChild.textContent = "Error contacting EVAI server.";
  }
});
