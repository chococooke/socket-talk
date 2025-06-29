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

      const res = await API.get(`/groups/${group.id}/messages`);
      setState({ messages: res.messages });

      renderMessages(res.messages);
      joinSocketRoom(group.id);
    };

    list.appendChild(item);
  });
}

export function renderMessages(messages) {
  const container = document.getElementById("messageList");
  container.innerHTML = "";

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerText = `${msg.User.username}: ${msg.text}`;
    container.appendChild(div);
  });
}

export function appendMessage(msg) {
  const container = document.getElementById("messageList");
  const div = document.createElement("div");

  div.className = "message";
  div.innerText = `${msg.username}: ${msg.text}`;

  container.appendChild(div);
}
