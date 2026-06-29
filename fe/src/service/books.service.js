import api from '../config/api'

export const getAllBooks = async () =>{
    const rs = await api.get('/books');
    console.log(rs.data);

    return rs.data
}