import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Settings, AlertCircle, Cpu, FilePlus } from 'lucide-react';
import { UploadedDocument } from '../types';
import { estimateTokenCount } from '../services/gemini';

interface SidebarProps {
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
  modelConfig: { temperature: number; maxOutputTokens: number };
  setModelConfig: React.Dispatch<React.SetStateAction<{ temperature: number; maxOutputTokens: number }>>;
  onClearChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  setDocuments, 
  modelConfig, 
  setModelConfig,
  onClearChat
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: UploadedDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await readFileAsText(file);
      
      newDocs.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        content: text,
        tokens: estimateTokenCount(text)
      });
    }

    setDocuments(prev => [...prev, ...newDocs]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string || '');
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const totalTokens = documents.reduce((acc, doc) => acc + doc.tokens, 0);

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full text-slate-100 flex-shrink-0 transition-all">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2 text-brand-400">
          <Cpu className="w-6 h-6" />
          RAG Chatbot
        </h1>
        <p className="text-xs text-slate-400 mt-1">Powered by Gemini 2.5 Flash</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Knowledge Base Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Knowledge Base
            </h2>
            <span className="text-xs text-slate-500">{documents.length} files</span>
          </div>
          
          <div className="space-y-2 mb-3">
            {documents.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-slate-700 rounded-lg bg-slate-800/50">
                <p className="text-sm text-slate-400">No documents uploaded</p>
                <p className="text-xs text-slate-500 mt-1">Upload .txt, .md, .json, .csv to start chatting</p>
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="group flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700 hover:border-brand-500 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-brand-900/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-200 truncate" title={doc.name}>{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.tokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-2">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded border border-slate-600 transition-all text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Documents
            </button>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Total Context: {totalTokens.toLocaleString()} / 1,000,000 tokens
            </p>
          </div>
        </div>

        <div className="h-px bg-slate-700 my-4" />

        {/* Settings Section */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" />
            Model Settings
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Temperature</span>
                <span className="text-slate-200">{modelConfig.temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={modelConfig.temperature}
                onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

             <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Max Tokens</span>
                <span className="text-slate-200">{modelConfig.maxOutputTokens}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="8000" 
                step="100" 
                value={modelConfig.maxOutputTokens}
                onChange={(e) => setModelConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-700 my-4" />

         <div className="bg-blue-900/20 border border-blue-800/50 rounded p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">
              This demo uses Gemini's Long Context Window as a highly effective RAG alternative. Entire documents are analyzed in real-time.
            </p>
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900 z-10">
        <button 
          onClick={onClearChat}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 py-2 rounded transition-colors text-sm"
        >
          <FilePlus className="w-4 h-4" />
          New Chat Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;