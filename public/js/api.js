import { getToken, logOut } from "./auth.js";
import { state } from "./state.js";
import { showCriticalAlert } from "./ui.js";

const baseUrl = state.baseUrl;

const API = {
  async get(path) {
    return fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (res.status !== 200) {
        console.log(res);
      } else {
        return res.json();
      }
    });
  },
  async post(path, body) {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.status !== 200) {
        console.log(res);
      } else {
        return res.json();
      }
    });
  },
};

export default API;
