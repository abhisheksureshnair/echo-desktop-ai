import mongoose from "mongoose"

const aiSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        provider: {
            type: String,
            default: "NVIDIA",
        },

        apiKey: {
            iv: {
                type: String,
                required: true,
            },
            data: {
                type: String,
                required: true,
            },
        },

        baseUrl: {
            type: String,
            required: true,
        },

        model: {
            type: String,
            required: true,
        },

        temperature: {
            type: Number,
            default: 0.2,
            min: 0,
            max: 2,
        },

        maxTokens: {
            type: Number,
            default: 1024,
            min: 1,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

const AiModels = mongoose.model("AiModels", aiSchema)
export default AiModels