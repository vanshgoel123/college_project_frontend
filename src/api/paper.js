import api from "./axios";

export const paperAPI = {

    search: (query) => api.get("/papers/searchPaper", { params: { query } }),


    getAllPapers: () => api.get("/papers/getAllPapers"),
    getJournals: () => api.get("/papers/getUserJournals"),
    getConferences: () => api.get("/papers/getUserConferencePapers"),
    getBookChapters: () => api.get("/papers/getUserBookChapter"),


    deletePaper: (id) => api.delete(`/papers/deletePaper/${id}`),
    toggleStar: (id) => api.post(`/star/toggleStar/${id}`),
};