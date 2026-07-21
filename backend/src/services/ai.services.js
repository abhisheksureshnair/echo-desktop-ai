import AiModels from "../models/AIModels.js";
import { encrypt } from "../utils/encryption.js"
import { findUser } from "./auth.services.js";

export const addModel = async (userId, apiKey, provider, baseUrl, model, temperature, maxTokens) => {
    const encryptedKey = encrypt(apiKey);

    const finduser = await findUser(userId);

    await AiModels.updateMany(
        { user: userId }, { status: "Disconnected" }
    );

    await AiModels.findOneAndUpdate({ user: userId },
        {
            apiKey: encryptedKey,
            provider,
            baseUrl,
            model,
            temperature,
            maxTokens,
            status: "Connected",
        },
        {
            new: true,
            upsert: true,
        }
    );
    return "Ai Models Added Successfully";
};

export const fetchModelList = async (userId) => {
    const user = await findUser(userId);

    return {
        model: user.model,
        provider: user.provider,
        status: user.status
    };
}