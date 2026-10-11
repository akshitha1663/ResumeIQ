import api from "./api";

export const loginUser = (userData) => {
  return api.post("/auth/login", userData);
};

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};