import { findUser, loginResponce, registrationServices } from "../services/auth.services.js"

export const registration = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body
        const responce = await registrationServices(fullname, username, email, password);
        return res.status(200).json({
            success: true,
            message: "Registraction Success",
            ...responce
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }

}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const responce = await loginResponce(username, password);
        return res.status(200).json({
            success: true,
            message: "Login Success",
            ...responce
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

export const fetchUser = async (req, res) => {
    try {
        const user = req.user.id;
        const responce = await findUser(user);
        return res.status(200).json({
            success: true,
            message: "Success",
            ...responce
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }


}