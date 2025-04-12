import axios from "axios";

const BASE_URL = "https://sticky-list.onrender.com"; // Replace with your backend URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
