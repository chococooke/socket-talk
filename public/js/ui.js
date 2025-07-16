import { state, setState } from "./state.js";
import API from "./api.js";
import { joinSocketRoom } from "./chat.js";

export function renderGroupsList(groups) {
  const list = document.getElementById("groupList");
  const messageList = document.getElementById("messageList");
  list.innerHTML = "";

  groups.forEach((group) => {
    const currentMessages = group.Messages;

    // const lastMessage =
    //   currentMessages.length > 0
    //     ? group.Messages[group.Messages.length - 1]
    //     : {text: "", User: {username: ""}};

    let lastMessage = "";
    let lastMessageString = "";

    if (currentMessages.length > 0) {
      lastMessage = group.Messages[group.Messages.length - 1];
      if (lastMessage.text.startsWith("<img ")) {
        lastMessage.text = `<i class="fa-solid fa-image"></i> Photo`;
      }

      if (lastMessage.text.includes("class='message-file'")) {
        lastMessage.text = `<i class="fas fa-paperclip"></i> File`;
      }

      if (
        lastMessage.text.includes(".gif") &&
        lastMessage.text.includes("<img")
      ) {
        lastMessage.text = `<i class="fa-solid fa-image"></i> GIF`;
      }
      lastMessage.text =
        lastMessage.text.length > 32
          ? lastMessage.text.substring(0, 24) + "..."
          : lastMessage.text;
      lastMessageString = `<span>${lastMessage.User.username}:</span><i class="fa-solid fa-check"></i> ${lastMessage.text}`;
    } else {
      lastMessage = "";
      lastMessageString = "🚫 <em> Empty chat!<em>";
    }

    const grpSettings = document.getElementById("grp-settings");
    const item = document.createElement("div");
    item.innerHTML = `
    <div class='grp-details'>
      <span class='grp-title'>${group.name}</span>
      <span class='grp-last-message'>${lastMessageString}</span>
    </div>`;
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

const grpSettings = document.getElementById("grp-settings");

export function renderChatArea(group) {
  const chatForm = document.getElementById("chat-form");
  const heading = document.getElementById("chat-area-heading");

  const headingOptions = document.createElement("div");

  const chatCloseBtn = document.createElement("button");
  const grpSettingsBtn = document.createElement("button");

  const grpSettingsCloseBtn = document.getElementById("grp-settings-close");

  chatCloseBtn.className = "chat-close-btn";
  chatCloseBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  chatCloseBtn.title = "Close this chat";

  grpSettingsBtn.innerHTML = `<i class="fa-solid fa-gear"></i>`;

  chatCloseBtn.addEventListener("click", () => {
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
    renderGroupMemberSettings(group.members);
  }
}

function renderGroupMemberSettings(members) {
  const membersList = document.getElementById("grp-settings-members");
  const usersList = document.createElement("ul");
  const addUsersCTA = document.createElement("button");
  addUsersCTA.textContent = "Add more users";

  if (!members || members === null) {
    membersList.innerHTML = "";
    return;
  }

  const currentUser = members.filter(
    (member) => member.username === state.currentUser.username
  );

  const isAdmin = currentUser[0].UserGroup.isAdmin;

  membersList.innerHTML = "";

  members.forEach((member, index) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    const btns = document.createElement("div");
    const roleBtn = document.createElement("button");
    const rmvBtn = document.createElement("button");
    rmvBtn.style.backgroundColor = "#ff3f33";
    rmvBtn.style.color = "#fff";
    rmvBtn.className = "exit-grp-btn";

    p.textContent = member.username;
    roleBtn.textContent = member.UserGroup.isAdmin
      ? "Remove Admin"
      : "Make Admin";

    if (!isAdmin) {
      roleBtn.style.display = "none";
      rmvBtn.style.display = "none";
      if (member.UserGroup.isAdmin) {
        p.innerHTML = `${member.username}<small id='admin-tag'>admin</small>`;
      }
    }

    rmvBtn.textContent = "Remove";
    rmvBtn.style.display = isAdmin ? "" : "none";

    if (member.username === state.currentUser.username) {
      roleBtn.setAttribute("disabled", "");
      rmvBtn.textContent = "Exit Group";
    }

    if (member.username === state.currentUser.username) {
      rmvBtn.style.display = "";
      rmvBtn.textContent = "Exit Group";
    }

    roleBtn.addEventListener("click", async () => {
      try {
        const res = await API.post(
          `/groups/${state.selectedGroup.id}/members/${member.id}/admin`,
          {}
        );

        member.UserGroup.isAdmin = !member.UserGroup.isAdmin;
        renderGroupMemberSettings(members);
        alert(res.success);
      } catch (err) {
        console.error("Error in toggleAdmin", err);
      }
    });

    rmvBtn.addEventListener("click", async () => {
      try {
        const res = await API.post(
          `/groups/${state.selectedGroup.id}/members/${member.id}/delete`,
          {}
        );

        if (member.id === state.currentUser.id) {
          const currentGrpIndex = state.groups.indexOf(state.selectedGroup);
          state.groups.splice(currentGrpIndex, 1);
          renderGroupsList(state.groups);
          setState({ selectedGroup: null });
          renderChatArea(state.selectedGroup);
          grpSettings.style.display = "none";
          return;
        }

        members.splice(index, 1);
        renderGroupMemberSettings(members);
        alert(res.success);
      } catch (err) {
        console.error("Error in toggleAdmin", err);
      }
    });

    btns.append(rmvBtn, roleBtn);
    li.append(p, btns);
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

    const msgTimestamp = new Date(msg.createdAt)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();

    div.innerHTML = `<strong>${msg.User.username}</strong> <p>${msg.text}<p><small class="message-timestamp">${msgTimestamp}</small>`;

    container.appendChild(div);
  });
}

export function appendMessage(msg, group) {
  const lastMessage = group.Messages[group.Messages.length - 1];
  const lastMessageId = lastMessage ? lastMessage.id : 0;
  const container = document.getElementById("messageList");
  const div = document.createElement("div");
  div.className = "message";
  if (msg.username !== state.currentUser.username) {
    div.classList.add("received");
  } else {
    div.classList.add("sent");
  }

  const msgTimestamp = new Date(msg.createdAt)
    .toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  div.innerHTML = `<strong>${msg.username}</strong> <p>${msg.text}<p><small class="message-timestamp">${msgTimestamp}</small>`;

  container.appendChild(div);

  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth",
  });

  const stateMessageUpdate = {
    id: lastMessageId + 1,
    text: msg.text,
    createdAt: msg.createdAt,
    User: {
      username: msg.username,
    },
  };

  group.Messages.push(stateMessageUpdate);
  renderGroupsList(state.groups);
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

  if (typeof grpName !== "string" || grpName === "") {
    window.alert("Group name cannot be empty.");
    return;
  }
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
