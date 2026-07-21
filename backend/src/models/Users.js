import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            trim: true
        },
        username: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        hashedPassword: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Users = mongoose.model("Users", userSchema)

export default Users
