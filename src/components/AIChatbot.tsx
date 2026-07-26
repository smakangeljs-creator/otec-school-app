import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, X, Send, Bot, Clock, Calendar, RefreshCw, ChevronDown, Award, HelpCircle } from 'lucide-react';
import { AppData } from '../types';
import dataManager from '../lib/db';
import app from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface AIChatbotProps {
  data: AppData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot({ data }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am **OTEC Edu-AI**, your grounded school intelligence assistant. I can help you lookup fee accounts, outstanding balances, search registered guardian contacts, analyze streams, or calculate aggregate averages immediately. Ask me anything!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    if (!textToSend) setInput('');

    const newMessages = [...messages, { role: 'user', content: query } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const functions = getFunctions(app);
      const generateChatReply = httpsCallable(functions, 'generateChatReply');

      const response = await generateChatReply({
        messages: newMessages,
        appData: data,
        currentDateTime: new Date().toLocaleString()
      });

      const resData = response.data as { reply: string, updatedData?: any };
      setMessages(prev => [...prev, { role: 'assistant', content: resData.reply }]);
      
      if (resData.updatedData) {
        dataManager.setData(resData.updatedData);
        window.dispatchEvent(new CustomEvent('otec-toast', {
          detail: {
            message: 'Live database updated by OTEC Edu-AI Assistant!',
            type: 'success'
          }
        }));
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ **Connection Error**: ${err.message || 'Something went wrong while loading the AI response.'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Pre-formatted query suggestions
  const suggestions = [
    "Record an income of 450,000 UGX under Tuition Fees (Cash) with description 'Tuition for Nabakka'",
    "Add student 'Kato Julius', Male, class P7, guardian 'Nsubuga John' 0772200300",
    "Record 92 marks in Mathematics for student L1001 on exam set-1",
    "List the fee balances and outstanding balances"
  ];

  // Helper to render formatted chat messages with basic markdown support (bold, list, paragraphs)
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;

      // Handle bullet points
      const isBullet = line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ');
      if (isBullet) {
        content = line.replace(/^[-*•]\s+/, '');
      }

      // Parse Bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      const contentStr = String(content);

      while ((match = boldRegex.exec(contentStr)) !== null) {
        if (match.index > lastIndex) {
          parts.push(contentStr.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < contentStr.length) {
        parts.push(contentStr.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-800 leading-relaxed mb-1">
            {finalLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-800 leading-relaxed mb-1.5 min-h-[0.5rem]">
          {finalLine}
        </p>
      );
    });
  };

  return (
    <div id="otec-chatbot-hub" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-80 sm:w-96 h-[480px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex flex-col justify-between gap-1 border-b border-slate-800 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600/35 text-blue-400 rounded-lg border border-blue-500/20">
                    <Bot size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-50 flex items-center gap-1">
                      OTEC Edu-AI Assistant
                      <Sparkles size={11} className="text-amber-400 fill-amber-400" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Real-time Grounded Agent</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Time and Date Tracking Bar */}
              <div className="flex items-center gap-2.5 mt-2 bg-slate-850/80 p-2 border border-slate-800/60 rounded-xl text-[9.5px] text-slate-300 font-semibold">
                <div className="flex items-center gap-1 font-medium">
                  <Calendar size={11} className="text-blue-400 shrink-0" />
                  <span>{currentTime || 'Syncing clock...'}</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE CONTEXT</span>
                </div>
              </div>
            </div>

            {/* Suggestions / Prompt Starters */}
            <div className="bg-slate-50 border-b border-slate-200/60 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Award size={12} className="text-blue-600" />
                <span>Quick School Queries</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    disabled={loading}
                    className="shrink-0 text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all hover:border-slate-300 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white ${
                        isUser ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      {isUser ? <HelpCircle size={12} /> : <Bot size={12} />}
                    </div>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {isUser ? <p className="text-xs leading-relaxed">{m.content}</p> : renderMessageContent(m.content)}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0">
                    <Bot size={12} />
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analyzing School Database...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about students, fee balances, PLE advice..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-slate-900 hover:bg-slate-950 text-white rounded-full shadow-2xl flex items-center gap-2.5 cursor-pointer border border-slate-850"
      >
        <div className="relative">
          <MessageSquare size={18} className="text-blue-400" />
          <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse"></span>
        </div>
        <span className="text-xs font-extrabold tracking-wide">OTEC Edu-AI</span>
        <Sparkles size={12} className="text-amber-400 fill-amber-400" />
      </motion.button>
    </div>
  );
}
