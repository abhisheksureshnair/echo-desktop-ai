import api from "./axios"

export const addModelApi = (data) => {
    return api.post("/assistence/add-model", data)
}
export const fetchModelApi = () => {
    return api.get("/assistence/fetch-model")
}