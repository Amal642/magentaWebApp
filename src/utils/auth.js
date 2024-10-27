// src/utils/auth.js
export function loginUser(username, password) {
    if (username === "admin" && password === "admin") {
      return "owner";
    } else if (username === "magenta" && password === "magenta") {
      return "supervisor";
    } else {
      return null;
    }
  }
  