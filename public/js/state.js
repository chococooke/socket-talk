import {BASE_URL} from "./config.js";

export const state = {
  users: [],
  grpSelectedUsers: [],
  baseUrl: BASE_URL,
  currentUser: null,
  token: null,
  groups: [],
  selectedGroup: null,
  message: [],
  socket: null,
};

export function setState(partial) {
  Object.assign(state, partial);
}
