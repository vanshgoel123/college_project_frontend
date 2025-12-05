import axios from "axios";
const BASE_URL = "http://172.16.61.173:8000/api/v1";
const api = axios.create({
    baseURL:BASE_URL,
    withCredentials: true, // ye cookies  include karwata hai request mei
});

export default api