import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { AppState, Message, UploadedDocument } from './types';
import { generateRAGResponse } from './services/gemini';
import { Send, AlertTriangle, Key } from 'lucide-react';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm your RAG Assistant. Upload documents on the left, and I'll answer questions based on their content.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // In a real app, manage this securely. For this demo, we read from env or let user input it.
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [showKeyModal, setShowKeyModal] = useState(!process.env.API_KEY);
  
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.3, // Lower temperature for more factual RAG responses
    maxOutputTokens: 2048
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError("Please provide a Gemini API Key to continue.");
      setShowKeyModal(true);
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
        modelConfig
      );

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        sources: documents.map(d => d.name) // Simplified attribution
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || "An error occurred while communicating with Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: crypto.randomUUID(),
      role: 'model',
      content: "Chat history cleared. I'm ready for new questions about your documents.",
      timestamp: Date.now()
    }]);
  };

  return (
    <Router>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <Sidebar 
          documents={documents} 
          setDocuments={setDocuments}
          modelConfig={modelConfig}
          setModelConfig={setModelConfig}
          onClearChat={handleClearChat}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Header */}
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-10">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Chat Session</h2>
              <p className="text-xs text-slate-500">
                Context: {documents.length} document(s) loaded
              </p>
            </div>
            
            <button 
              onClick={() => setShowKeyModal(true)}
              className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
            >
              <Key className="w-3 h-3" />
              {apiKey ? 'Update API Key' : 'Set API Key'}
            </button>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 scroll-smooth">
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-150"></div>
                    <span className="text-xs text-slate-500 ml-2">Analyzing documents...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center mb-6">
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="max-w-3xl mx-auto relative">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={documents.length > 0 ? "Ask a question about your documents..." : "Upload a document to start RAG..."}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Gemini may display inaccurate info, including about people, so double-check its responses.
              </p>
            </div>
          </div>

          {/* API Key Modal */}
          {showKeyModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-bold text-slate-800">Enter Gemini API Key</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  To use this RAG Chatbot, you need a Google Gemini API key. 
                  The key is stored in your browser's memory and is never sent to our servers.
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                   <button 
                    onClick={() => {
                      if(process.env.API_KEY) {
                         setApiKey(process.env.API_KEY);
                         setShowKeyModal(false);
                      } else {
                         // allow closing if we just wanted to check the key, but assume user knows what they are doing if they leave it empty
                         setShowKeyModal(false);
                      }
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (apiKey.trim()) setShowKeyModal(false);
                    }}
                    disabled={!apiKey.trim()}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Save & Continue
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">
                  Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Google AI Studio</a>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Router>
  );
};

export default App;