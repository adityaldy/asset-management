import rateLimit from "express-rate-limit";

/**
 * Rate limiter specifically for chat endpoints
 * More restrictive than general API rate limiter
 */
export const chatRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute per IP
    message: {
        success: false,
        message: "Terlalu banyak pertanyaan. Silakan tunggu sebentar sebelum bertanya lagi."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Chat input validation middleware
 */
export const chatValidation = (req, res, next) => {
    const { message } = req.body;

    // Check if message exists
    if (!message) {
        return res.status(400).json({
            success: false,
            message: "Pertanyaan tidak boleh kosong"
        });
    }

    // Check message type
    if (typeof message !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Format pertanyaan tidak valid"
        });
    }

    // Check message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Pertanyaan tidak boleh kosong"
        });
    }

    if (trimmedMessage.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Pertanyaan terlalu pendek (minimal 3 karakter)"
        });
    }

    if (trimmedMessage.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Pertanyaan terlalu panjang (maksimal 1000 karakter)"
        });
    }

    // Sanitize: Check for obvious SQL injection attempts in the message itself
    const suspiciousPatterns = [
        /;\s*DROP\s+/i,
        /;\s*DELETE\s+/i,
        /;\s*UPDATE\s+/i,
        /;\s*INSERT\s+/i,
        /UNION\s+SELECT/i,
        /--\s*$/,
        /\/\*.*\*\//,
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmedMessage)) {
            return res.status(400).json({
                success: false,
                message: "Pertanyaan mengandung karakter atau pola yang tidak diizinkan"
            });
        }
    }

    // Passed all validations
    next();
};

export default {
    chatRateLimiter,
    chatValidation
};
