import { setState } from "./state.js";

export function getToken() {
  return localStorage.getItem("token");
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[[1]]));
  } catch (e) {
    return null;
  }
}

export function initAuth() {
  const token = getToken();
  if (!token) return false;

  const user = decodeToken(token);
  if (!user) return false;

  setState({ token, currentUser: user });
  return true;
}

export function logOut() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}
