import axios from "axios";
const BASE_URL = "/api/v1";
const api = axios.create({
    baseURL:BASE_URL,
    withCredentials: true, // ye cookies  include karwata hai request mei
});

export default api