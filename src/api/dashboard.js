import api from "./axios";

export const dashboardAPI = {

    getStats: () => {
        return api.get("/dashboard/userStats");
    }
};