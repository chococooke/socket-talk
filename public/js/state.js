export const state = {
  baseUrl: `http://localhost:5000`,
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
