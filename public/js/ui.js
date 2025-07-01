import { state, setState } from "./state.js";
import API from "./api.js";
import { joinSocketRoom } from "./chat.js";

export function renderGroupsList(groups) {
  const list = document.getElementById("groupList");
  const messageList = document.getElementById("messageList");
  list.innerHTML = "";

  groups.forEach((group) => {
    const grpSettings = document.getElementById("grp-settings");
    const item = document.createElement("div");
    item.innerHTML = `<i class="fa-solid fa-users"></i> <span>${group.name}</span>`;
    item.className = "group-item";
    item.onclick = async () => {
      grpSettings.style.display = "none";
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
  if(group === null || !group) return;
  renderGroupMemberSettings(group.members);

  const chatForm = document.getElementById("chat-form");
  const heading = document.getElementById("chat-area-heading");

  const headingOptions = document.createElement("div");

  const chatCloseBtn = document.createElement("button");
  const grpSettingsBtn = document.createElement("button");

  const grpSettings = document.getElementById("grp-settings");
  const grpSettingsCloseBtn = document.getElementById("grp-settings-close");

  chatCloseBtn.className = "chat-close-btn";
  chatCloseBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  chatCloseBtn.title = "Close this chat";

  grpSettingsBtn.innerHTML = `<i class="fa-solid fa-gear"></i>`;

  chatCloseBtn.addEventListener("click", () => {
    console.log(state.selectedGroup);
    setState({ selectedGroup: null });
    renderChatArea(state.selectedGroup);
  });

  grpSettingsBtn.addEventListener("click", () => {
    if (grpSettings.style.display === "none") {
      grpSettings.style.display = "";
    } else {
      grpSettings.style.display = "none";
    }
  });

  grpSettingsCloseBtn.addEventListener("click", () => {
    grpSettings.style.display = "none";
  });

  headingOptions.append(grpSettingsBtn, chatCloseBtn);
  heading.appendChild(headingOptions);
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
    heading.appendChild(headingOptions);
  }
}

function renderGroupMemberSettings(members) {
  if (!members || members === null) return;
  const currentUser = members.filter(
    (member) => member.username === state.currentUser.username
  );

  if (!currentUser[0].UserGroup.isAdmin) return;

  const membersList = document.getElementById("grp-settings-members");
  membersList.innerHTML = "";

  members.forEach((member) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    const btn = document.createElement("button");

    if (member.username === state.currentUser.username)
      btn.setAttribute("disabled", "");

    p.textContent = member.username;
    btn.textContent = member.UserGroup.isAdmin ? "Remove Admin" : "Make Admin";

    btn.addEventListener("click", async () => {
      try {
        const res = await API.post(
          `/groups/${state.selectedGroup.id}/members/${member.id}/admin`,
          {}
        );
        alert(res.success);
        member.UserGroup.isAdmin = !member.UserGroup.isAdmin;
        renderGroupMemberSettings(members);
      } catch (err) {
        console.error("Error in toggleAdmin", err);
      }
    });

    li.append(p, btn);
    membersList.appendChild(li);
  });
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

export function renderOnlineUsers(onlineUsers) {
  const ul = document.getElementById("online-users");
  ul.innerHTML = "";

  onlineUsers.forEach((user) => {
    const li = document.createElement("li");
    if (user.username === state.currentUser.username) {
      li.style.display = "none";
    }
    li.textContent = user.username;
    ul.appendChild(li);
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

export function showCriticalAlert(alert, redirection, action) {
  const alertDiv = document.createElement("div");
  const alertDivChild = document.createElement("div");
  alertDiv.className = "critical-alert";
  const alertText = document.createElement("p");

  alertText.textContent = alert;

  const actionBtn = document.createElement("button");
  actionBtn.textContent = action;
  actionBtn.onclick = () => {
    if (!redirection || redirection !== "") {
      window.location.href = redirection;
    }

    document.body.removeChild(alertDiv);
  };

  alertDivChild.append(alertText, actionBtn);
  alertDiv.appendChild(alertDivChild);

  document.body.appendChild(alertDiv);
}