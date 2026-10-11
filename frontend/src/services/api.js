import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const email = sessionStorage.getItem("authEmail");
  const password = sessionStorage.getItem("authPassword");

  if (email && password) {
    config.auth = {
      username: email,
      password: password,
    };
  }

  return config;
});

export default api;