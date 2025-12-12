import api from "./axios";

export const adminAPI = {

    getDashboardStats: () => api.get("/admin/dashboard"),


    getAllUsers: () => api.get("/admin/getAllUsers"),


    getAnalyticsFromTo: (from, to) => api.post("/admin/fromTo", { from, to }),


    getUserDetails: (userId) => api.get(`/admin/user/${userId}`),
};