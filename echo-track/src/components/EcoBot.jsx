import React, { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import robotAnimation from '../../AI Robo/chatbot.json';

const EcoBot = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Chat State
    const [messages, setMessages] = useState([
        { text: "Hi! I'm EcoBot. How can I help you navigate?", isUser: false }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleNav = (destination) => {
        if (onNavigate) {
            const pageMap = {
                'Dashboard': 'home',
                'Add Device': 'log-activity',
                'Profile': 'profile'
            };
            const page = pageMap[destination] || 'home';
            onNavigate(page);
            setIsOpen(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue.trim();
        setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
            } else {
                setMessages(prev => [...prev, { text: "Use your Gemini API key to power me up!", isUser: false }]);
                console.error("Chat Error:", data.error);
            }
        } catch (error) {
            console.error("Connection Error:", error);
            setMessages(prev => [...prev, { text: "I'm having trouble connecting right now.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-2 w-80 h-96 flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-green-600 px-4 py-3 text-white shrink-0">
                        <span className="font-semibold text-sm">EcoBot Assistant 🤖</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-green-700 rounded-full p-1 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area - Scrollable */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.isUser
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (only show if few messages or always? Let's keep them if chat is empty or always at bottom? 
                        Maybe move them to top of messages? Or just keep them overlay?
                        Let's put them in a separate scrollable area or just sticky at bottom of messages if needed.
                        For now, let's remove strict placement inside messages and put them above footer if user hasn't typed much, 
                        BUT to save space, let's just make them a part of the "intro" message logic or remove to clean up UI.
                        Actually, retaining them as helper buttons above input is nice.
                    */}
                    {messages.length < 3 && (
                        <div className="px-4 pb-2 bg-gray-50 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
                            <div className="flex space-x-2">
                                {[
                                    { label: 'Map', action: 'Dashboard' },
                                    { label: 'Add Log', action: 'Add Device' },
                                    { label: 'My Stats', action: 'Profile' }
                                ].map((chip) => (
                                    <button
                                        key={chip.label}
                                        onClick={() => handleNav(chip.action)}
                                        className="rounded-full bg-white border border-green-200 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors shadow-sm"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-100 p-3 flex gap-2 bg-white shrink-0">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 rounded-full bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Robot Avatar */}
            <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Tooltip */}
                <div
                    className={`absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity duration-200 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}
                >
                    Need Help?
                    {/* Tooltip Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>

                {/* Lottie Animation */}
                <div className="w-32 transition-transform duration-300 hover:scale-110 drop-shadow-lg">
                    <Lottie animationData={robotAnimation} loop={true} />
                </div>
            </div>

        </div>
    );
};

export default EcoBot;