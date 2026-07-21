import crypto from "crypto";

const algorithm = "aes-256-cbc";

const getKey = () => {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY is missing in .env");
    }

    return crypto
        .createHash("sha256")
        .update(process.env.ENCRYPTION_KEY)
        .digest();
};

export const encrypt = (text) => {
    const key = getKey();

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
        iv: iv.toString("hex"),
        data: encrypted,
    };
};

export const decrypt = (encrypted) => {
    const key = getKey();

    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(encrypted.iv, "hex")
    );

    let decrypted = decipher.update(encrypted.data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
