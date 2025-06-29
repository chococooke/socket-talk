import { state, setState } from "./state.js";
import { renderGroupsList, renderMessages, appendMessage } from "./ui.js";
import API from "./api.js";
import { getToken, initAuth } from "./auth.js";

if (!initAuth()) {
  alert("Not logged in.");
  window.location.href = "/login.html";
}

const socket = io("http://localhost:5000");
setState({ socket });

const groupRes = await API.get("/groups");
setState({ groups: groupRes.groups });
renderGroupsList(groupRes.groups);

export function joinSocketRoom(groupId) {
  socket.emit("join-group", groupId);
}

socket.on("receive-message", (msg) => {
  appendMessage(msg);
});

document.getElementById("sendBtn").onclick = async () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !state.selectedGroup) return;

  await API.post(`/groups/${state.selectedGroup.id}/messages`, { text });

  socket.emit("send-message", {
    groupId: state.selectedGroup.id,
    message: {
      text,
      userId: state.currentUser.id,
      username: state.currentUser.username
    },
  });

  input.value = "";
};
