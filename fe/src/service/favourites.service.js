import api from "../config/api";

export const getMyFavourites = async () => {
    const rs = await api.get("/favourites/my-favourites");
    return rs.data;
};

export const toggleFavourite = async (bookId) => {
    const rs = await api.post("/favourites/toggle", { bookId });
    return rs.data;
};
