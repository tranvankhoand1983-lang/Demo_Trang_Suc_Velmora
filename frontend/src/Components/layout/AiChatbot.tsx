import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import './AiChatbot.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Dạ, Velmora Jewelry xin chào anh/chị. Cửa hàng có thể trợ giúp gì cho hành trình tìm kiếm món trang sức hoàn hảo của mình ạ? ✨', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the Native C# AI API
      const response = await api.post('/chat', { message: text });
      const data = response.data;
      setIsTyping(false);
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    } catch (error: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, { text: 'Lỗi mạng React: ' + error.message, sender: 'bot' }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <div className={`velmora-chat-bubble ${isOpen ? 'hide' : ''}`} onClick={toggleChat}>
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </div>

      <div className={`velmora-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-info">
            <div className="avatar">V</div>
            <div>
              <h4>Velmora Assistant</h4>
              <span>Trực tuyến</span>
            </div>
          </div>
          <button className="close-chat" onClick={toggleChat}>&times;</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const formatText = (text: string) => {
              let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              html = html.replace(/\n/g, '<br/>');
              return { __html: html };
            };

            return (
              <div 
                key={idx} 
                className={`message ${msg.sender}`}
                dangerouslySetInnerHTML={formatText(msg.text)} 
              />
            );
          })}
          {isTyping && (
            <div className="message bot">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Nhắn tin cho Velmora..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend}>GỬI</button>
        </div>
      </div>
    </>
  );
};

export default AiChatbot;
