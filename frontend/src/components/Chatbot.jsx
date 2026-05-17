import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hello! I'm your Bookmark Assistant. Ask me something like 'Show me my frontend bookmarks' or 'I need help with devops'." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('bt_token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: input })
      });

      const result = await response.json();
      
      if (result.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: result.data.message,
          bookmarks: result.data.bookmarks
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: "Sorry, I'm having trouble connecting to the ML service. Please try again later." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-brand-accent text-white shadow-2xl shadow-brand-accent/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce-slow"
        >
          <MessageCircle size={32} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] glass-card shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-500 overflow-hidden border-brand-accent/20">
          {/* Header */}
          <div className="p-4 bg-brand-accent text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Powered by ML Service</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-brand-accent text-white rounded-tr-none' 
                    : 'bg-brand-surface text-brand-text border border-brand-border rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  
                  {msg.bookmarks && msg.bookmarks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.bookmarks.map(bm => (
                        <a 
                          key={bm.id} 
                          href={bm.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block p-2 rounded-lg bg-brand-bg/50 border border-brand-border hover:border-brand-accent/50 transition-colors"
                        >
                          <div className="text-xs font-bold truncate">{bm.title}</div>
                          <div className="text-[10px] text-brand-muted truncate opacity-70">{bm.url}</div>
                        </a>
                      ))}
                    </div>
                  )}
                  {msg.bookmarks && msg.bookmarks.length === 0 && (
                    <p className="text-xs italic mt-2 opacity-70">No matching bookmarks found.</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-brand-surface border border-brand-border rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <Loader2 className="animate-spin text-brand-accent" size={20} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-brand-border bg-brand-surface">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-brand-accent/50 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-brand-accent disabled:opacity-30"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
