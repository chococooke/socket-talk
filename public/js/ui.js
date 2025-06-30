import { state, setState } from "./state.js";
import API from "./api.js";
import { joinSocketRoom } from "./chat.js";


export function renderGroupsList(groups) {
  const list = document.getElementById("groupList");
  list.innerHTML = "";

  groups.forEach((group) => {
    const item = document.createElement("div");
    item.innerText = group.name;
    item.className = "group-item";
    item.onclick = async () => {
      setState({ selectedGroup: group });
      renderChatArea(group);

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
  const heading = document.getElementById("chat-area-heading");
  const messageList = document.getElementById("messageList");
  if (group === null) {
    heading.innerText = "Select A Group";
  } else {
    heading.innerText = group.name;
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
  createGrpForm.style.display = "none";
  rendersUsersList(state.users);
});
