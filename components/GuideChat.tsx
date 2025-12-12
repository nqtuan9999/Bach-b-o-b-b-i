import React, { useState, useRef, useEffect } from 'react';
import { chatWithGuideStream } from '../services/geminiService';
import { ChatMessage, AppSettings } from '../types';
import ReactMarkdown from 'react-markdown';
import { GenerateContentResponse } from '@google/genai';

interface GuideChatProps {
  settings: AppSettings;
}

const GuideChat: React.FC<GuideChatProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Xin chào! Mình là Thổ Địa Bến Thành. Bạn có thể hỏi mình bất cứ điều gì! (I speak many languages!)',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const color = settings.theme;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const result = await chatWithGuideStream(history, userMsg.text, settings);
      
      let fullResponseText = '';
      const responseMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: responseMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullResponseText += chunkText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === responseMsgId ? { ...msg, text: fullResponseText } : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Lỗi kết nối / Connection error.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-16">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? `bg-${color}-600 text-white rounded-br-none`
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
              }`}
            >
              {msg.role === 'model' ? (
                 <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-slate-100 flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-16 left-0 w-full bg-white p-4 border-t border-slate-100">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Chat with AI Guide..."
            className={`flex-1 bg-slate-100 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-${color}-500 outline-none transition-all`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`bg-${color}-600 text-white p-3 rounded-full hover:bg-${color}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideChat;