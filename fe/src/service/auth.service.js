import api from "../config/api"

export const login = async (email, password) => {
    const rs = await api.post("/users/login",{
        email, password,
    });

    return rs.data;

}

export const register = async (fullname, email, password) => {
    const rs = await api.post("/users/register", {
        fullname, email, password,
    });

    return rs.data;
}

export const getUserInfo = async () => {
    const rs = await api.get("/users/me");
    return rs.data;
}

export const updateProfile = async (fullname, email, password) => {
    const rs = await api.put("/users/me", {
        fullname, email, password
    });
    return rs.data;
}

export const verifyLogin2FA = async (userId, otp) => {
    const rs = await api.post("/users/login/verify-2fa", { userId, otp });
    return rs.data;
};

export const requestEnable2FA = async () => {
    const rs = await api.post("/users/2fa/request-enable");
    return rs.data;
};

export const verifyEnable2FA = async (otp) => {
    const rs = await api.post("/users/2fa/verify-enable", { otp });
    return rs.data;
};

export const disable2FA = async () => {
    const rs = await api.post("/users/2fa/disable");
    return rs.data;
};

export const forgotPassword = async (email) => {
    const rs = await api.post("/users/forgot-password", { email });
    return rs.data;
};

export const resetPassword = async (token, newPassword) => {
    const rs = await api.post("/users/reset-password", { token, newPassword });
    return rs.data;
};