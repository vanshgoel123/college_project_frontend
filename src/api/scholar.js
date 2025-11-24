import api from "./axios.js";

export const scholarAPI = {

    getAuthorId: (url) => {
        return api.post("/users/getAuthorID", {
             url: url
        });
    },


    syncPapers: (authorId) => {
        return api.post("/users/authorProfile", {
             authorId: authorId
        });
    }
};