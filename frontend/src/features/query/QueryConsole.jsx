/**
 * Query Console Feature
 * 
 * This component provides a chat interface for users to interact with the system.
 * It allows users to ask natural language questions about their documents and
 * displays the generated answers along with source citations.
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import api from '../../api/client';

const QueryConsole = () => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState(null);

    // Mutation to handle query submission
    const queryMutation = useMutation({
        mutationFn: async (q) => {
            const res = await api.post('/query', { query: q, synthesize: true });
            return res.data;
        },
        onSuccess: (data) => {
            // Add the system's response to the chat history
            const interaction = {
                type: 'answer',
                text: data.answer,
                sources: data.sources,
                id: data.created_memory_id
            };
            setHistory(prev => [...prev, interaction]);
            setCurrentAnswer(null);
        },
        onError: (err) => {
            setHistory(prev => [...prev, { type: 'error', text: err.message }]);
            setCurrentAnswer(null);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Add user's message to history immediately
        setHistory(prev => [...prev, { type: 'user', text: query }]);
        setCurrentAnswer({ loading: true });

        // Trigger the API call
        queryMutation.mutate(query);
        setQuery('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* Chat History Area */}
            <div className="flex-1 overflow-auto p-8 space-y-6">
                {history.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl rounded-2xl p-6 ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700'}`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                            {/* Source Citations */}
                            {msg.sources && (
                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold mb-2 opacity-70">Sources:</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {msg.sources.map((source, sIdx) => (
                                            <div key={sIdx} className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
                                                <FileText size={16} className="mt-1 flex-shrink-0 opacity-50" />
                                                <div>
                                                    <span className="font-medium text-primary dark:text-blue-400">{source.filename}</span>
                                                    <span className="text-slate-400 mx-2">•</span>
                                                    <span className="text-slate-500">Page {source.page_number}</span>
                                                    <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs line-clamp-2">"{source.text}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Feedback Buttons */}
                                    <div className="mt-4 flex space-x-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-green-500 transition-colors"><ThumbsUp size={16} /></button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-colors"><ThumbsDown size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {currentAnswer?.loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a legal question about your documents..."
                        className="w-full pl-6 pr-14 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || currentAnswer?.loading}
                        className="absolute right-3 top-3 p-2 bg-primary text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QueryConsole;
