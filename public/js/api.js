import { getToken } from "./auth.js";
import { state } from "./state.js";

const baseUrl = state.baseUrl;

const API = {
  async get(path) {
    return fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => res.json());
  },
  async post(path, body) {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};

export default API;
