import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.BASE_URL,
    withCredentials: true, // ye cookies  include karwata hai request mei
});

export default api