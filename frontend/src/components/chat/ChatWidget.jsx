import { useState, useRef, useEffect } from 'react';
import { HiChat, HiX, HiPaperAirplane, HiRefresh } from 'react-icons/hi';
import { sendChatQuery } from '../../api/chat';
import ChatMessage from './ChatMessage';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: {
                type: 'text',
                message: 'Halo! Saya AI Assistant untuk IT Asset Management. Anda bisa bertanya tentang data aset, seperti:\n\n• "Berapa total aset yang ada?"\n• "Tampilkan aset yang statusnya repair"\n• "Aset mana yang paling mahal?"\n• "Berapa total nilai aset per kategori?"'
            },
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        const message = inputValue.trim();
        if (!message || isLoading) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: { type: 'text', message },
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendChatQuery(message);
            
            // Add assistant response
            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: {
                    type: response.type,
                    ...response.data
                },
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            
            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                content: {
                    type: 'error',
                    message: error.response?.data?.message || 'Maaf, terjadi kesalahan. Silakan coba lagi.'
                },
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: Date.now(),
                type: 'assistant',
                content: {
                    type: 'text',
                    message: 'Chat telah direset. Silakan bertanya tentang data aset.'
                },
                timestamp: new Date()
            }
        ]);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={isOpen ? 'Tutup Chat' : 'Buka AI Chat'}
            >
                {isOpen ? (
                    <HiX className="w-6 h-6 text-white" />
                ) : (
                    <HiChat className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <HiChat className="w-5 h-5" />
                            <span className="font-semibold">AI Chat Query</span>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-1 hover:bg-blue-700 rounded transition-colors"
                            title="Reset Chat"
                        >
                            <HiRefresh className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-sm">Sedang memproses...</span>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tanya tentang aset..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            Powered by Gemini 2.0 Flash
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
