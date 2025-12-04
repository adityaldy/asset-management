import api from './axios';

/**
 * Send a chat query to the AI service
 * @param {string} message - Natural language question
 * @returns {Promise<object>} - AI response with data
 */
export const sendChatQuery = async (message) => {
    const response = await api.post('/chat/query', { message });
    return response.data;
};

/**
 * Get chat service status
 * @returns {Promise<object>} - Service status
 */
export const getChatStatus = async () => {
    const response = await api.get('/chat/status');
    return response.data;
};

export default {
    sendChatQuery,
    getChatStatus
};
