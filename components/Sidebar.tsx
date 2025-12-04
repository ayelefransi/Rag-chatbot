import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Settings, Cpu, FilePlus, Sparkles, X } from 'lucide-react';
import { UploadedDocument, Language } from '../types';
import { estimateTokenCount } from '../services/gemini';
import { motion } from 'framer-motion';
import { t } from '../utils/translations';
import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM import quirks where the module might be on the default property
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Initialize the PDF.js worker
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface SidebarProps {
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
  modelConfig: { temperature: number; maxOutputTokens: number };
  setModelConfig: React.Dispatch<React.SetStateAction<{ temperature: number; maxOutputTokens: number }>>;
  onClearChat: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  setDocuments, 
  modelConfig, 
  setModelConfig,
  onClearChat,
  language,
  setLanguage,
  isOpen,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: UploadedDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await readFileContent(file);
      
      newDocs.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || 'text/plain',
        content: text,
        tokens: estimateTokenCount(text)
      });
    }

    setDocuments(prev => [...prev, ...newDocs]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            // @ts-ignore
            .map((item: any) => item.str)
            .join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        return fullText;
      } catch (error) {
        console.error("Error reading PDF:", error);
        return `[Error reading PDF file: ${file.name}. Ensure it is a valid text-based PDF.]`;
      }
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string || '');
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const totalTokens = documents.reduce((acc, doc) => acc + doc.tokens, 0);

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-[85%] sm:w-80 bg-slate-900 border-r border-slate-700 
          flex flex-col h-full text-slate-100 shadow-xl 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              <Cpu className="w-6 h-6 sm:w-7 sm:h-7 text-brand-400" />
              {t(language, 'appTitle')}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 pl-1">{t(language, 'poweredBy')}</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Switcher */}
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setLanguage('en')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${language === 'en' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('am')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${language === 'am' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              አማርኛ
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Knowledge Base Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                {t(language, 'knowledgeBase')}
              </h2>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 border border-slate-700">
                {documents.length} {t(language, 'files')}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              {documents.length === 0 ? (
                <div 
                  className="text-center p-6 border border-dashed border-slate-700 rounded-xl bg-slate-800/30"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">{t(language, 'noDocs')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t(language, 'uploadPrompt')}</p>
                </div>
              ) : (
                documents.map((doc, index) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between bg-slate-800/50 p-2.5 rounded-lg border border-slate-700 hover:border-brand-500/50 hover:bg-slate-800 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-900/50 to-indigo-900/50 flex items-center justify-center text-brand-400 flex-shrink-0 border border-white/5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.tokens.toLocaleString()} tokens</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeDocument(doc.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full overflow-hidden group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-2.5 px-4 rounded-lg border border-white/10 transition-all shadow-lg hover:shadow-brand-500/20 text-sm font-medium"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
                <Upload className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t(language, 'uploadButton')}</span>
              </button>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-slate-500">{t(language, 'totalContext')}</span>
                <span className={`text-[10px] font-medium ${totalTokens > 220000 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {totalTokens.toLocaleString()} / 240,000
                </span>
              </div>
              {/* Visual Token Meter */}
              <div className="h-1 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${totalTokens > 220000 ? 'bg-amber-500' : 'bg-brand-500'}`}
                  style={{ width: `${Math.min(100, (totalTokens / 240000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6" />

          {/* Settings Section */}
          <div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-5">
              <Settings className="w-4 h-4 text-brand-400" />
              {t(language, 'modelSettings')}
            </h2>

            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{t(language, 'temperature')}</span>
                  <span className="text-brand-300 bg-brand-900/30 px-2 py-0.5 rounded text-[10px] border border-brand-500/20">{modelConfig.temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={modelConfig.temperature}
                  onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400"
                />
              </div>

              <div className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{t(language, 'maxTokens')}</span>
                  <span className="text-brand-300 bg-brand-900/30 px-2 py-0.5 rounded text-[10px] border border-brand-500/20">{modelConfig.maxOutputTokens}</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="8000" 
                  step="100" 
                  value={modelConfig.maxOutputTokens}
                  onChange={(e) => setModelConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6" />

          <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200 leading-relaxed opacity-80">
                {t(language, 'ragInfo')}
              </p>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 z-10">
          <button 
            onClick={() => {
              onClearChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 py-2.5 rounded-lg transition-all text-sm font-medium border border-transparent hover:border-slate-700"
          >
            <FilePlus className="w-4 h-4" />
            {t(language, 'newChat')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;