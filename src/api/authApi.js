import api from "./axios";

export const registraction = (data) => {
    return api.post("/auth/registration", data)
}

export const login = (data) => {
    return api.post("/auth/login", data)
}

export const fetchUser = () => {
    return api.get("/auth/me")
}
