import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Loader2, Bot, User, Leaf } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your GreenRoute Eco-Assistant. I can help you understand your carbon footprint or suggest ways to make your daily commute more sustainable!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: input,
        config: {
          systemInstruction: 'You are an elite environmental advisor for the GreenRoute app. Your goal is to encourage sustainable commuting. Use data points about CO2 reduction, health benefits of active travel, and urban planning. Be concise, expert, and friendly.',
          thinkingConfig: { thinkingBudget: 8000 }
        },
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I am processing your request. Please try asking in a different way.' }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am currently over capacity. Please try again in a moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-inter">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 w-[350px] md:w-[420px] h-[550px] rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-700 p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-xl border border-white/20">
                <Leaf size={22} className="text-green-300" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest leading-none">Eco AI Expert</h3>
                <p className="text-[10px] text-green-100 font-bold opacity-80 mt-1 uppercase">Powered by Gemini Pro</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-slate-950 space-y-6 custom-scrollbar"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-none font-bold' 
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-none font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your eco-impact..."
                className="flex-grow bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-green-500/50 outline-none text-gray-900 dark:text-white"
                aria-label="Chat input message"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-3.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-green-600/30 flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-90 group relative"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 animate-pulse"></div>
        </button>
      )}
    </div>
  );
};