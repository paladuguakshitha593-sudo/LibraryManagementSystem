import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import api from '../../api';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Librarian. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setLoading(true);

    try {
      console.log('Sending message to AI:', userMsg);
      const response = await api.post('/ai/chat', { message: userMsg });
      console.log('AI Response:', response.data);
      
      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
      } else {
        throw new Error('Malformed response from AI');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMsg = err.response?.data?.reply || "Sorry, I'm having trouble connecting to the library brain right now. Please check if the backend is running.";
      setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`ai-fab ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="AI Librarian"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <div className="header-info">
            <div className="bot-avatar"><Bot size={20} /></div>
            <div>
              <h3>AI Librarian</h3>
              <span className="online-tag">Online</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-btn"><X size={18} /></button>
        </div>

        <div className="ai-messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper bot">
              <div className="message-bubble loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ai-chat-input-area">
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default AIChatbot;
