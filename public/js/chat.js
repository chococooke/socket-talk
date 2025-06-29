const baseURL = `http://localhost:5000`;
const socket = io(baseURL);

const groupId = 1;
const userId = 1;

socket.emit("join-group", groupId);

socket.on("receive-message", (msg) => {
  const div = document.createElement("div");
  div.textContent = `${msg.userId}: ${msg.text}`;
  document.getElementById("messages").appendChild(div);
});

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  await axios.post(`${baseURL}/groups/${groupId}/messages`, {
    text,
    userId,
  });

  socket.emit("send-message", { groupId, message: { text, userId } });
  input.value = "";
}
