import { state, setState } from "./state.js";
import API from "./api.js";
import { joinSocketRoom } from "./chat.js";

// document.addEventListener("DOMContentLoaded", () => {
//   const uploadFormWrapper = document.getElementById("upload-form-wrapper");
//   uploadFormWrapper.style.display = "none";
// });

export function renderGroupsList(groups) {
  const list = document.getElementById("groupList");
  const messageList = document.getElementById("messageList");
  list.innerHTML = "";

  groups.forEach((group) => {
    const item = document.createElement("div");
    item.innerText = group.name;
    item.className = "group-item";
    item.onclick = async () => {
      const prevActiveGrp = document.getElementById("grp-item-active");
      if (!prevActiveGrp) {
        item.setAttribute("id", "grp-item-active");
      } else {
        prevActiveGrp.removeAttribute("id");
        item.setAttribute("id", "grp-item-active");
      }

      setState({ selectedGroup: group });
      renderChatArea(group);

      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });

      const res = await API.get(`/groups/${group.id}/messages`);
      setState({ messages: res.messages });

      renderMessages(res.messages);
      joinSocketRoom(group.id);
    };

    list.appendChild(item);
  });
}

export function rendersUsersList(users) {
  const list = document.getElementById("create-grp-select-members");

  users.forEach((user) => {
    const li = document.createElement("li");
    if (user.id === state.currentUser.id) {
      li.style.display = "none";
    }
    const addButton = document.createElement("button");
    const p = document.createElement("p");

    addButton.addEventListener("click", () => {
      state.grpSelectedUsers.push(user.id);
      addButton.setAttribute("disabled", "");
    });

    p.innerText = `${user.username}`;
    addButton.innerText = "Add";

    li.append(p, addButton);
    list.appendChild(li);
  });
}

export function renderChatArea(group) {
  const chatForm = document.getElementById("chat-form");
  const heading = document.getElementById("chat-area-heading");
  const chatCloseBtn = document.createElement("button");
  chatCloseBtn.className = "chat-close-btn";
  chatCloseBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  chatCloseBtn.title = "Close this chat";

  chatCloseBtn.addEventListener("click", () => {
    setState({ selectedGroup: null });
    renderChatArea(null);
  });
  heading.appendChild(chatCloseBtn);
  const messageList = document.getElementById("messageList");
  if (group === null) {
    heading.innerHTML = "";
    heading.style.display = "none";
    chatForm.style.display = "none";
    messageList.style.display = "none";
  } else {
    heading.style.display = "";
    chatForm.style.display = "";
    messageList.style.display = "";
    heading.innerHTML = group.name;
    heading.appendChild(chatCloseBtn);
  }
}

export function renderMessages(messages) {
  const container = document.getElementById("messageList");
  container.innerHTML = "";

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "message";
    if (msg.User.username === state.currentUser.username) {
      div.classList.add("sent");
    } else {
      div.classList.add("received");
    }
    div.innerHTML = `<strong>${msg.User.username}</strong> <p>${msg.text}<p>`;

    container.appendChild(div);
  });
}

export function appendMessage(msg) {
  const container = document.getElementById("messageList");
  const div = document.createElement("div");
  div.className = "message";
  if (msg.username !== state.currentUser.username) {
    div.classList.add("received");
  } else {
    div.classList.add("sent");
  }

  div.innerHTML = `<strong>${msg.username}</strong> <p>${msg.text}<p>`;

  container.appendChild(div);

  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });
}

// group creation
const createGrpDiv = document.getElementById("grp-creation-form-wrapper");
const createGrpBtn = document.getElementById("create-grp-btn");
const createGrpBtnClose = document.getElementById("create-grp-btn-close");
const createGrpForm = document.getElementById("create-grp-form");
const createGrpInput = document.getElementById("grp-name-input");

createGrpBtn.addEventListener("click", (event) => {
  if (createGrpDiv.style.display === "none") {
    createGrpDiv.style.display = "";
  } else {
    createGrpDiv.style.display = "none";
  }
});

createGrpBtnClose.addEventListener("click", () => {
  createGrpDiv.style.display = "none";
});

createGrpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const grpName = createGrpInput.value.trim();
  const members = state.grpSelectedUsers;

  const groupRes = await API.post("/groups", { name: grpName });

  if (members.length !== 0) {
    await API.post(`/groups/${groupRes.group.id}/add-members`, { members });
  }

  const groupsRes = await API.get("/groups");
  setState({ groups: groupsRes.groups });
  renderGroupsList(groupsRes.groups);

  createGrpForm.reset();
  createGrpDiv.style.display = "none";
  rendersUsersList(state.users);
});

// upload form handling
const uploadFormWrapper = document.getElementById("upload-form-wrapper");
const uploadFormCancelBtn = document.getElementById("upload-form-cancel");
const uploadFileBtn = document.getElementById("file-upload-btn");

uploadFileBtn.addEventListener("click", () => {
  console.log(uploadFormWrapper.style.display);
  if (uploadFormWrapper.style.display === "none") {
    uploadFormWrapper.style.display = "";
  } else {
    uploadFormWrapper.style.display = "none";
  }
});

uploadFormCancelBtn.addEventListener("click", () => {
  uploadFormWrapper.style.display = "none";
});
