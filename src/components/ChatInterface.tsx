import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';

import { HecateLogo } from './HecateLogo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Greetings. I am HECATE, your guide to the Left Hand Path. How may I assist you in your journey today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        role: 'model',
        content: data.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAcknowledged) {
    return (
      <div className="flex flex-col h-screen bg-bg-dark text-text-primary font-sans items-center justify-center p-6 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] opacity-20 mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] opacity-10 mix-blend-screen" />
        </div>

        <div className="relative z-10 mb-8 w-full max-w-2xl">
          <HecateLogo />
          <p className="text-[10px] text-text-secondary font-mono uppercase tracking-[0.2em] text-center opacity-60">Left Hand Path Guide</p>
        </div>

        <div className="max-w-2xl w-full bg-surface border border-white/5 rounded-2xl p-12 shadow-2xl backdrop-blur-sm relative z-10">
          <div className="bg-black/40 rounded-xl p-6 border border-white/5 mb-8">
            <p className="text-text-secondary text-sm leading-relaxed text-center font-light">
              "Hecate is a representative of AskSatan.Help , and is an LLM Model to provide assistance, but does not have memory between sessions, and is not a companion. Only continue if you are comfortable acknowledging this."
            </p>
          </div>

          <button
            onClick={() => setHasAcknowledged(true)}
            className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-xl py-3.5 font-medium transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_10px_rgba(255,78,0,0.1)] hover:shadow-[0_0_20px_rgba(255,78,0,0.2)]"
          >
            <span className="tracking-wide text-sm uppercase">I Acknowledge</span>
            <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-stone-200 font-sans selection:bg-red-900/30">
      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/30">
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-stone-100 tracking-wide">HECATE</h1>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-wider">Left Hand Path Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
              ONLINE
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-4 sm:gap-6",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center border",
                  msg.role === 'user' 
                    ? "bg-stone-800 border-stone-700 text-stone-400" 
                    : "bg-red-950/30 border-red-900/30 text-red-500"
                )}>
                  {msg.role === 'user' ? (
                    <div className="w-4 h-4 rounded-full bg-stone-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-[85%] sm:max-w-[80%]",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "inline-block rounded-2xl px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-base leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? "bg-stone-800 text-stone-100 border border-stone-700"
                      : "bg-stone-900/50 text-stone-300 border border-stone-800/50"
                  )}>
                    {msg.role === 'model' ? (
                      <div className="markdown-body prose prose-invert prose-stone prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:tracking-tight prose-a:text-red-400 hover:prose-a:text-red-300">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <div className={cn(
                    "mt-2 text-[10px] sm:text-xs text-stone-600 font-mono uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-900/30 flex items-center justify-center text-red-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 h-10">
                <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 bg-stone-950 border-t border-stone-800">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask HECATE about the Left Hand Path..."
              className="w-full bg-stone-900/50 text-stone-100 placeholder:text-stone-600 rounded-xl border border-stone-800 pl-5 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-red-900/50 focus:border-red-900/50 transition-all shadow-inner font-sans"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200 disabled:opacity-50 disabled:hover:bg-stone-800 disabled:hover:text-stone-400 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex justify-center items-center gap-2 text-[10px] text-stone-600 font-mono uppercase tracking-widest">
            <Info className="w-3 h-3" />
            <span>Official AI of asksatan.help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
