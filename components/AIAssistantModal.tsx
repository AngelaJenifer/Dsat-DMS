import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAIInsights } from '../services/geminiService.ts';
import { ICONS } from '../constants.tsx';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: any;
  systemInstruction: string;
  quickActions: string[];
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, contextData, systemInstruction, quickActions }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversation, setConversation] = useState<{ query: string, response: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Reset state when opened
            setConversation([]);
            setError(null);
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation, isLoading, scrollToBottom]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const currentQuery = query;
        setQuery('');
        setIsLoading(true);
        setError(null);
        setConversation(prev => [...prev, { query: currentQuery, response: '' }]);

        try {
            const response = await getAIInsights(contextData, currentQuery, systemInstruction);
            setConversation(prev => {
                const newConversation = [...prev];
                newConversation[newConversation.length - 1].response = response;
                return newConversation;
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setConversation(prev => prev.slice(0, -1)); // Remove the user's query if it failed
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickAction = (text: string) => {
        setQuery(text);
        // We need a small delay for the state to update before submitting
        setTimeout(() => {
            inputRef.current?.form?.requestSubmit();
        }, 50);
    }

    if (!isOpen) return null;

    const QuickActionButton: React.FC<{ text: string }> = ({ text }) => (
        <button
            onClick={() => handleQuickAction(text)}
            className="text-sm bg-brand-light text-gray-200 px-3 py-1 rounded-full hover:bg-brand-accent transition-colors"
        >
            {text}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-lg bg-brand-dark text-brand-text shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right"
                onClick={e => e.stopPropagation()}
                aria-modal="true"
                role="dialog"
                aria-labelledby="ai-assistant-title"
            >
                <div className="flex justify-between items-center p-4 border-b border-brand-light">
                    <div className="flex items-center space-x-3">
                        <div className="text-brand-accent">{ICONS.sparkles}</div>
                        <h2 id="ai-assistant-title" className="text-xl font-bold">AI Assistant</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close AI Assistant" className="p-1 rounded-full hover:bg-brand-light">
                        {ICONS.close}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversation.length === 0 && !isLoading && (
                         <div className="text-center py-8">
                            <div className="text-brand-accent mx-auto h-10 w-10">{ICONS.sparkles}</div>
                            <p className="text-gray-400 mt-4">Ask me anything about the current view.</p>
                             <div className="mt-6 flex flex-wrap justify-center gap-2">
                                 {quickActions.map(action => <QuickActionButton key={action} text={action} />)}
                             </div>
                        </div>
                    )}
                    {conversation.map((entry, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex justify-end">
                                <p className="bg-brand-accent text-white p-3 rounded-lg max-w-xs break-words">{entry.query}</p>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-brand-light p-3 rounded-lg max-w-sm">
                                    {entry.response ? (
                                        <p className="text-sm whitespace-pre-wrap">{entry.response}</p>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span className="text-sm">Thinking...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {error && <p className="text-status-red p-2 bg-red-500/10 rounded-md text-sm">{error}</p>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-brand-light">
                    <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 bg-brand-light border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-accent placeholder:text-gray-500"
                            disabled={isLoading}
                            aria-label="Ask the AI assistant a question"
                        />
                        <button type="submit" disabled={isLoading || !query.trim()} className="bg-brand-accent text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent/90 transition-colors" aria-label="Send question">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AIAssistantModal;
