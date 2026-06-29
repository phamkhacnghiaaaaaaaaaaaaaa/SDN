import api from "../config/api"

export const login = async (email, password) => {
    const rs = await api.post("/users/login",{
        email, password,
    });

    return rs.data;

}