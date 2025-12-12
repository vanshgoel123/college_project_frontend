import api from "./axios";

export const userAPI = {
    
    getProfile: () => api.get("/users/getUser"),


    updateProfile: (data) => api.patch("/users/updateDetails", data),


    updateAvatar: (formData) => api.patch("/users/updateAvatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),

    updateCoverImage: (formData) => api.patch("/users/updateCoverImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),


    changePassword: (data) => api.patch("/users/changePassword", data),


    setPassword: (data) => api.post("/users/setPassword", data),




    completeProfile: (formData) => api.post("/users/completeProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),


    deleteAccount: () => api.delete("/users/delete"),

    generateReport: (options) => api.post("/users/report", options, {
        responseType: 'blob'
    }),



};