import api from '../config/api'

export const getAllBooks = async (page = 1, limit = 10) =>{
    const rs = await api.get(`/books?page=${page}&limit=${limit}`);
    console.log(rs.data);

    return rs.data;
}

export const getBookById = async (id) => {
    const rs = await api.get(`/books/${id}`);
    return rs.data;
};