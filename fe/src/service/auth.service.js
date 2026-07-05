import axios from "axios"

export const login = async (email, password) => {
    const rs = await axios.post("/users/login",{
        email, password,
    });

    return rs.data;

}