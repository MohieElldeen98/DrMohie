import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <article className={`prose prose-slate prose-lg max-w-none rtl:prose-p:text-right rtl:prose-headings:text-right rtl:prose-ul:text-right prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-xl prose-img:shadow-lg ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override specific elements if needed
          h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-200 pb-2" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed text-slate-700 mb-4" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-700 marker:text-primary-500" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-500 bg-primary-50 p-4 rounded-r-lg italic text-slate-700 my-6" {...props} />,
          code: ({node, ...props}) => {
             // @ts-ignore
             const inline = props.inline;
             return inline 
              ? <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
              : <div className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto my-6"><code className="font-mono text-sm" {...props} /></div>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;