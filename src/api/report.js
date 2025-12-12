import api from "./axios";

export const reportAPI = {
    // Generates the report.
    // options = { title: true, authors: true, ... }
    // We use responseType: 'blob' to handle the binary file data
    generateReport: (options) => api.post("/users/report", options, {
        responseType: 'blob'
    }),
};