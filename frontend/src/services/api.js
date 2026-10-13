import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/api";

const normalizedBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL: normalizedBaseUrl,
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