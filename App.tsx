import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { Message, UploadedDocument, Language } from './types';
import { generateRAGResponse } from './services/gemini';
import { Send, AlertTriangle, Menu } from 'lucide-react';
import { t } from './utils/translations';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: t('en', 'welcomeMessage'),
      timestamp: Date.now()
    }
  ]);
  
  // Update welcome message when language changes if it's the only message
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        role: 'model',
        content: t(language, 'welcomeMessage'),
        timestamp: Date.now()
      }]);
    }
  }, [language]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Directly use process.env.API_KEY. No UI to update it.
  const apiKey = process.env.API_KEY;
  
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.3, 
    maxOutputTokens: 2048
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError(t(language, 'errorKey'));
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await generateRAGResponse(
        apiKey,
        messages,
        userMessage.content,
        documents,
        modelConfig,
        language
      );

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        sources: documents.map(d => d.name)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      let errorMessage = err.message || t(language, 'errorGeneric');
      
      // Better error message for quota issues
      if (JSON.stringify(err).includes("429") || errorMessage.includes("429")) {
        errorMessage = "Quota exceeded (429). Please wait a moment before trying again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: crypto.randomUUID(),
      role: 'model',
      content: t(language, 'clearedMessage'),
      timestamp: Date.now()
    }]);
    setError(null);
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar 
          documents={documents} 
          setDocuments={setDocuments}
          modelConfig={modelConfig}
          setModelConfig={setModelConfig}
          onClearChat={handleClearChat}
          language={language}
          setLanguage={setLanguage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative z-0 w-full">
          
          {/* Header */}
          <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                  {t(language, 'chatSession')}
                </h2>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                  {documents.length} {t(language, 'contextLoaded')}
                </p>
              </div>
            </div>
            
            {!apiKey && (
               <div className="text-[10px] md:text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">API_KEY Missing</span>
                <span className="sm:hidden">No Key</span>
              </div>
            )}
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-3xl mx-auto pb-4">
              <AnimatePresence>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-8"
                >
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-md flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-brand-500 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-brand-500 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-brand-500 rounded-full"></motion.div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{t(language, 'analyzing')}</span>
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center mb-8"
                >
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm shadow-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-5 bg-white border-t border-slate-100 flex-shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={documents.length > 0 ? t(language, 'placeholderReady') : t(language, 'placeholderEmpty')}
                  className="w-full pl-4 md:pl-5 pr-12 md:pr-14 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-inner text-sm md:text-base text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                  disabled={isLoading}
                  autoFocus={window.innerWidth > 768} // Only autofocus on desktop
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-brand-500/30 transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-2 md:mt-3 font-medium opacity-70">
                {t(language, 'disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;