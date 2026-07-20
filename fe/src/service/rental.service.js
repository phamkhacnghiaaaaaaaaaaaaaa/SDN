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

export const getAllRentalsByStaff = async () => {
  const rs = await api.get("/rentals/staff/all");
  return rs.data;
};

export const updateStatusByStaff = async (id, status) => {
  const rs = await api.patch(`/rentals/staff/${id}/status`, {
    status: status,
  });
  return rs.data;
};

export const createRentalByStaff = async (rentalData) => {
  const rs = await api.post("/rentals/staff/create", rentalData);
  return rs.data;
};

export const extendRentalByStaff = async (id) => {
  const rs = await api.patch(`/rentals/staff/${id}/extend`);
  return rs.data;
};
