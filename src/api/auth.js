import api from "./axios.js";

export const authAPI = {

    register: (formData) => {
        return api.post("/users/register", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    login: (credentials) => {
        return api.post("/users/login", credentials);
    },


    googleLogin: (idToken) => {
        return api.post("/users/googleLogin", {
            idToken_name: idToken,
            idToken_email: idToken
        });
    }
};