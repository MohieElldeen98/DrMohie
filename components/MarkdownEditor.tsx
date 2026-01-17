import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Link as LinkIcon, 
  Quote, List, Image as ImageIcon, Eye, Edit2, Code
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write your masterpiece...",
  height = "h-96"
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(newValue);

    // Reset focus and selection
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const toolbar = [
    { icon: <Bold size={18} />, action: () => insertFormat('**', '**'), label: 'Bold' },
    { icon: <Italic size={18} />, action: () => insertFormat('*', '*'), label: 'Italic' },
    { icon: <Heading1 size={18} />, action: () => insertFormat('# ', ''), label: 'H1' },
    { icon: <Heading2 size={18} />, action: () => insertFormat('## ', ''), label: 'H2' },
    { icon: <List size={18} />, action: () => insertFormat('- ', ''), label: 'List' },
    { icon: <Quote size={18} />, action: () => insertFormat('> ', ''), label: 'Quote' },
    { icon: <Code size={18} />, action: () => insertFormat('```\n', '\n```'), label: 'Code' },
    { icon: <LinkIcon size={18} />, action: () => insertFormat('[', '](url)'), label: 'Link' },
    { icon: <ImageIcon size={18} />, action: () => insertFormat('![alt text](', ')'), label: 'Image' },
  ];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between bg-slate-50 px-2 py-2 border-b border-slate-200">
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === 'write' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit2 size={14} /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === 'preview' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>

        {/* Formatting Toolbar (Only visible in Write mode) */}
        {activeTab === 'write' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pl-2">
            {toolbar.map((tool, idx) => (
              <button
                key={idx}
                type="button"
                onClick={tool.action}
                title={tool.label}
                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg hover:text-slate-900 transition-colors"
              >
                {tool.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={`relative w-full ${height}`}>
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed text-slate-800 markdown-editor-textarea bg-white"
          />
        ) : (
          <div className="w-full h-full p-6 overflow-y-auto bg-white">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Nothing to preview yet...
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer / Status */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-xs text-slate-400 flex justify-between items-center">
        <span>Markdown Supported</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;