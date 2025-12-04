import { useState } from 'react';
import { HiChevronDown, HiChevronUp, HiClipboardCopy, HiCheck } from 'react-icons/hi';
import { formatCurrency } from '../../utils/export';

const ChatMessage = ({ message }) => {
    const { type, content, timestamp } = message;
    const [showSql, setShowSql] = useState(false);
    const [copied, setCopied] = useState(false);

    const isUser = type === 'user';

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const renderValue = (value, key) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number') {
            // Format as currency if it looks like price/value
            if (key?.toLowerCase().includes('price') || 
                key?.toLowerCase().includes('value') || 
                key?.toLowerCase().includes('total')) {
                return formatCurrency(value);
            }
            return value.toLocaleString('id-ID');
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const renderQueryResults = (data) => {
        const { results, rowCount, sql, explanation } = data;

        if (!results || results.length === 0) {
            return (
                <div className="text-gray-500 italic">
                    Tidak ada data yang ditemukan.
                </div>
            );
        }

        // Get column headers from first result
        const columns = Object.keys(results[0]);

        return (
            <div className="space-y-3">
                {/* Explanation */}
                {explanation && (
                    <p className="text-sm text-gray-700">{explanation}</p>
                )}

                {/* Results count */}
                <p className="text-xs text-gray-500">
                    Menampilkan {rowCount} hasil
                </p>

                {/* Results Table */}
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="min-w-full text-xs border border-gray-200 rounded">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                {columns.map((col) => (
                                    <th 
                                        key={col}
                                        className="px-2 py-1 text-left font-semibold text-gray-700 border-b"
                                    >
                                        {col.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, idx) => (
                                <tr 
                                    key={idx}
                                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    {columns.map((col) => (
                                        <td 
                                            key={col}
                                            className="px-2 py-1 border-b border-gray-100 whitespace-nowrap"
                                        >
                                            {renderValue(row[col], col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* SQL Query (collapsible) */}
                {sql && (
                    <div className="mt-2">
                        <button
                            onClick={() => setShowSql(!showSql)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                            {showSql ? <HiChevronUp /> : <HiChevronDown />}
                            {showSql ? 'Sembunyikan SQL' : 'Lihat SQL Query'}
                        </button>
                        
                        {showSql && (
                            <div className="mt-1 relative">
                                <pre className="bg-gray-800 text-green-400 text-xs p-2 rounded overflow-x-auto">
                                    {sql}
                                </pre>
                                <button
                                    onClick={() => copyToClipboard(sql)}
                                    className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white"
                                    title="Copy SQL"
                                >
                                    {copied ? (
                                        <HiCheck className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <HiClipboardCopy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (content.type) {
            case 'query':
                return renderQueryResults(content);
            
            case 'text':
            case 'error':
                return (
                    <p className={`text-sm whitespace-pre-wrap ${content.type === 'error' ? 'text-red-600' : ''}`}>
                        {content.message}
                    </p>
                );
            
            default:
                return (
                    <p className="text-sm whitespace-pre-wrap">
                        {content.message || JSON.stringify(content)}
                    </p>
                );
        }
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    isUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 shadow-sm'
                }`}
            >
                {renderContent()}
                <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(timestamp)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
