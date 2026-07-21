import Users from "../models/Users.js"
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export const registrationServices = async (fullname, username, email, password) => {
    const userExisting = await Users.findOne({ username });
    if (userExisting) {
        const error = new Error("Username already exists");
        error.statusCode = 400;
        throw error;
    }

    const emailExisting = await Users.findOne({ email });
    if (emailExisting) {
        const error = new Error("Email already exists");
        error.statusCode = 400;
        throw error
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new Users({
        fullname, username, email, hashedPassword
    });
    await newUser.save();

    return { user: newUser }
}

export const loginResponce = async (username, password) => {

    const user = await Users.findOne({
        $or: [
            { username: username },
            { email: username },
            { fullname: username }
        ]
    });
    if (!user) {
        const error = new Error("Invalid User")
        error.statusCode = 404;
        throw error
    }

    const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordMatch) {
        const error = new Error("Invalide Password");
        error.statusCode = 401;
        throw error
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
        }
    }
}

export const findUser = async (user) => {
    const finduser = await Users.findById(user).select("-hashedPassword");
    if (!finduser) {
        const error = new Error("User Not Find")
        error.statusCode = 404;
        throw error
    }
    return {
        finduser
    }
}