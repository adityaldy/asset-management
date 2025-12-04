import { generateChatResponse, validateSQLQuery } from "../services/geminiService.js";
import { db } from "../models/index.js";
import { QueryTypes } from "sequelize";

/**
 * Handle chat query from user
 * Process natural language question and return data from database
 */
export const processQuery = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Message too long (max 1000 characters)"
            });
        }

        // Generate AI response
        const aiResponse = await generateChatResponse(message.trim());

        // Handle different response types
        switch (aiResponse.type) {
            case "query":
                // Validate SQL query for safety
                const validation = validateSQLQuery(aiResponse.sql);
                if (!validation.isValid) {
                    return res.status(400).json({
                        success: false,
                        message: "Generated query is not safe",
                        reason: validation.reason
                    });
                }

                try {
                    // Execute the safe query
                    const results = await db.query(aiResponse.sql, {
                        type: QueryTypes.SELECT,
                        raw: true
                    });

                    return res.status(200).json({
                        success: true,
                        type: "query",
                        data: {
                            explanation: aiResponse.explanation,
                            sql: aiResponse.sql,
                            results: results,
                            rowCount: results.length
                        }
                    });
                } catch (queryError) {
                    console.error("Query execution error:", queryError);
                    return res.status(400).json({
                        success: false,
                        message: "Failed to execute query",
                        error: queryError.message
                    });
                }

            case "text":
                return res.status(200).json({
                    success: true,
                    type: "text",
                    data: {
                        message: aiResponse.message
                    }
                });

            case "error":
                return res.status(200).json({
                    success: true,
                    type: "error",
                    data: {
                        message: aiResponse.message
                    }
                });

            default:
                return res.status(200).json({
                    success: true,
                    type: "text",
                    data: {
                        message: aiResponse.message || JSON.stringify(aiResponse)
                    }
                });
        }
    } catch (error) {
        console.error("Chat controller error:", error);
        
        // Handle specific Gemini API errors
        if (error.message?.includes("GEMINI_API_KEY")) {
            return res.status(500).json({
                success: false,
                message: "AI service is not configured properly"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to process your question",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get chat service status
 */
export const getStatus = async (req, res) => {
    try {
        const hasApiKey = !!process.env.GEMINI_API_KEY;
        
        return res.status(200).json({
            success: true,
            data: {
                service: "AI Chat Query",
                status: hasApiKey ? "ready" : "not_configured",
                model: "gemini-2.0-flash"
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get service status"
        });
    }
};

export default {
    processQuery,
    getStatus
};
