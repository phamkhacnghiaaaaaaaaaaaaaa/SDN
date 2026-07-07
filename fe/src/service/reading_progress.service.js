import api from "../config/api";

export const getMyReadingProgress = async () => {
    const rs = await api.get("/reading-progress/my-progress");
    return rs.data;
};
