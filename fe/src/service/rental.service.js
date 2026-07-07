import api from "../config/api";

export const createRental = async (userId, items) => {
  const rs = await api.post("/rentals", {
    user_id: userId,
    items: items,
  });
  return rs.data;
};

export const getMyRentals = async () => {
  const rs = await api.get("/rentals");
  return rs.data;
};

export const cancelRental = async (id) => {
  const rs = await api.patch(`/rentals/${id}/status`, {
    status: "cancelled",
  });
  return rs.data;
};
