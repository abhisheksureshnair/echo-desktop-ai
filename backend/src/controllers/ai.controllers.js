import { addModel, fetchModelList } from "../services/ai.services.js";

export const addAIModels = async (req, res) => {
    try {
        const userId = req.user.id;
        const { apiKey, provider, baseUrl, model, temperature, maxTokens } = req.body;
        const responce = await addModel(userId, apiKey, provider, baseUrl, model, temperature, maxTokens);
        return res.status(200).json({
            success: true,
            message: responce,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

export const fetchModels = async (req, res) => {
    try {
        const userId = req.user.id;
        const responce = await fetchModelList(userId);
        res.status(200).json({
            success: true,
            data: responce
        })

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}