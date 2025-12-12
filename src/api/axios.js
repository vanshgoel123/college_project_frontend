import axios from "axios";
const BASE_URL = "https://scholar.iiitnr.ac.in/api/v1"

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api