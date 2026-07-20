import api from "../config/api";

/**
 * Service CRUD dùng chung cho 3 nhóm dữ liệu danh mục:
 * categories, authors, publishers.
 * `resource` là 1 trong: "categories" | "authors" | "publishers".
 */

export const getAll = async (resource) => {
    const rs = await api.get(`/${resource}`);
    return rs.data;
};

export const create = async (resource, data) => {
    const rs = await api.post(`/${resource}`, data);
    return rs.data;
};

export const update = async (resource, id, data) => {
    const rs = await api.put(`/${resource}/${id}`, data);
    return rs.data;
};

export const remove = async (resource, id) => {
    const rs = await api.delete(`/${resource}/${id}`);
    return rs.data;
};
