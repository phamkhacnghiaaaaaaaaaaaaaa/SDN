import api from '../config/api'

export const getAllBooks = async (page = 1, limit = 10) => {
    const rs = await api.get(`/books?page=${page}&limit=${limit}`);
    console.log(rs.data);

    return rs.data;
}

export const getBookById = async (id) => {
    const rs = await api.get(`/books/${id}`);
    return rs.data;
};

export const searchBooks = async (title) => {
    const rs = await api.get(`/books/search?title=${encodeURIComponent(title)}`);
    return rs.data;
};

export const updateBook = async (id, bookData) => {
    // Backend nhận ID qua params và data qua body
    const rs = await api.put(`/books/${id}`, bookData);
    return rs.data;
};

export const createBook = async (bookData) => {
    const rs = await api.post('/books', bookData);
    return rs.data;
};

export const deleteBook = async (id) => {
    const rs = await api.delete(`/books/${id}`);
    return rs.data;
};

export const getAllAuthors = async () => {
    const rs = await api.get('/authors');
    return rs.data;
};

export const getAllPublishers = async () => {
    const rs = await api.get('/publishers');
    return rs.data;
};

export const getAllCategories = async () => {
    const rs = await api.get('/categories');
    return rs.data;
};