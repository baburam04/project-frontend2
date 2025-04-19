import axios from "axios";

const BASE_URL = "https://sticky-list.onrender.com"; //Production
//const BASE_URL = "http://localhost:5000"; // Dev-Replace with your backend URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
