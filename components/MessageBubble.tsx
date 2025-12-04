import React from 'react';
import { Message } from '../types';
import { Bot, User, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white' 
            : 'bg-white text-brand-600 border border-brand-100'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm relative ${
            isUser 
              ? 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-md'
          }`}>
            <div className={`prose prose-sm max-w-none leading-relaxed ${isUser ? 'prose-invert' : 'prose-slate'}`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
          
          {/* Metadata */}
          <div className={`mt-2 flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
             <span className="text-[10px] text-slate-400 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && message.sources && message.sources.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 text-[10px] text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full"
              >
                <FileText className="w-3 h-3" />
                <span className="font-medium">{message.sources.length} sources</span>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default MessageBubble;
