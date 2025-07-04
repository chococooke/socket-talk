import { state, setState } from "./state.js";
import {
  renderGroupsList,
  rendersUsersList,
  appendMessage,
  renderChatArea,
  renderOnlineUsers,
  showCriticalAlert,
} from "./ui.js";
import API from "./api.js";
import { initAuth, logOut } from "./auth.js";

if (!initAuth()) {
  showCriticalAlert("Session Ended! Please Log in.", `${state.baseUrl}/login.html`, "Okay");
}

const socket = io(state.baseUrl);
setState({ socket });

socket.emit("user-online", {
  id: state.currentUser.id,
  username: state.currentUser.username,
});

socket.on("update-online-users", (users) => {
  renderOnlineUsers(users);
});

const groupRes = await API.get("/groups");
setState({ groups: groupRes.groups });
renderGroupsList(groupRes.groups);

const usersRes = await API.get("/users");
setState({ users: usersRes.users });
rendersUsersList(usersRes.users);

renderChatArea(state.selectedGroup);

export function joinSocketRoom(groupId) {
  socket.emit("join-group", groupId);
}

socket.on("receive-message", (msg) => {
  if(msg.groupId !== state.selectedGroup.id){
    return;
  }
  appendMessage(msg, state.selectedGroup);
});

document.getElementById("chat-form").onsubmit = async (event) => {
  event.preventDefault();
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !state.selectedGroup) return;

  socket.emit("send-message", {
    groupId: state.selectedGroup.id,
    message: {
      text,
      userId: state.currentUser.id,
      username: state.currentUser.username,
    },
  });

  await API.post(`/groups/${state.selectedGroup.id}/messages`, { text });
  input.value = "";
};

// file upload
const uploadFormWrapper = document.getElementById("upload-form-wrapper");
const uploadForm = document.getElementById("upload-form");
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (!file || !state.selectedGroup) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${state.baseUrl}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  const messageText = file.type.startsWith("image/")
    ? `<img class="file-message" src='${data.url}' style='max-width: 200px; border-radius: 8px;' />`
    : `<p class='message-file'><i class="fa-solid fa-link"></i> <a class='message-link' href='${data.url}' target='_blank'> ${data.originalName}</a></p>`;

  await API.post(`/groups/${state.selectedGroup.id}/messages`, {
    text: messageText,
  });

  socket.emit("send-message", {
    groupId: state.selectedGroup.id,
    message: {
      text: messageText,
      userId: state.currentUser.id,
      username: state.currentUser.username,
    },
  });

  fileInput.value = "";
  uploadFormWrapper.style.display = "none";
});

const logOutBtn = document.getElementById("logout-btn");
logOutBtn.addEventListener("click", () => {
  logOut();
});
