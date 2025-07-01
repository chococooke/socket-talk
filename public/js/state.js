export const state = {
  users: [],
  grpSelectedUsers: [],
  baseUrl: `http://localhost:5000`,
  currentUser: null,
  token: null,
  groups: [],
  selectedGroup: 1,
  message: [],
  socket: null,
};

export function setState(partial) {
  Object.assign(state, partial);
}
