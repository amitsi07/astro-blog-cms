import React, { useState } from 'react';
import {
  SpecialContentBlock,
  ImageBlock,
  DividerBlock,
  PromptBlock,
  CodeBlock,
  CalloutBlock,
  CtaBlock,
  ProsConsBlock,
  TakeawaysBlock,
  TableBlock,
  FaqBlock,
  TocBlock,
} from '../../types/cms';
import {
  Copy,
  Check,
  Sparkles,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  List,
  CheckSquare,
  XSquare,
  Image as ImageIcon,
} from 'lucide-react';

export const ImageBlockView: React.FC<{ block: ImageBlock }> = ({ block }) => {
  return (
    <figure className="my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#080c14] shadow-lg group">
      <div className="relative overflow-hidden bg-slate-950">
        <img
          src={block.url}
          alt={block.alt || 'Article visual element'}
          className="w-full h-auto object-cover max-h-[520px] transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />
      </div>
      {(block.caption || block.credit) && (
        <figcaption className="px-4 py-2.5 text-center text-xs text-slate-400 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-center gap-2">
          {block.caption && <span>{block.caption}</span>}
          {block.caption && block.credit && <span className="text-slate-600">·</span>}
          {block.credit && (
            <span className="text-slate-500 italic">Photo: {block.credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

export const DividerBlockView: React.FC<{ block: DividerBlock }> = ({ block }) => {
  return (
    <div className="my-10 flex items-center justify-center">
      <div className="w-full border-t border-slate-800 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-4 bg-[#080d17] text-slate-600 text-xs font-mono tracking-widest">
          ✦ ✦ ✦
        </div>
      </div>
    </div>
  );
};

export const PromptBlockView: React.FC<{ block: PromptBlock }> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Prompt Template</span>
          {block.modelTarget && (
            <span className="text-slate-400 font-normal normal-case">
              · Recommended: {block.modelTarget}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 transition-colors"
          title="Copy prompt text"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>
      </div>
      <div className="mt-3 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-[#060910] p-4 rounded-lg border border-indigo-500/10 select-all">
        {block.promptText}
      </div>
      {block.notes && (
        <p className="mt-2 text-xs text-indigo-300/80 italic">
          💡 {block.notes}
        </p>
      )}
    </div>
  );
};

export const CodeBlockView: React.FC<{ block: CodeBlock }> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-[#070b12] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-slate-300 font-medium">{block.filename || block.language}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 uppercase">{block.language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-slate-200 leading-relaxed">
        <code>{block.code}</code>
      </pre>
    </div>
  );
};

export const CalloutBlockView: React.FC<{ block: CalloutBlock }> = ({ block }) => {
  const configs = {
    info: {
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/20',
      text: 'text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
      defaultTitle: 'Information Note',
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      text: 'text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
      defaultTitle: 'Important Warning',
    },
    important: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      text: 'text-rose-200',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0" />,
      defaultTitle: 'Critical Notice',
    },
    tip: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20',
      text: 'text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      defaultTitle: 'Pro-Tip',
    },
  };

  const config = configs[block.type] || configs.info;

  return (
    <div className={`my-5 rounded-xl border ${config.border} ${config.bg} p-4 sm:p-5 flex gap-3.5`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-white mb-1">
          {block.title || config.defaultTitle}
        </h4>
        <p className={`text-sm ${config.text} leading-relaxed`}>{block.content}</p>
      </div>
    </div>
  );
};

export const CtaBlockView: React.FC<{ block: CtaBlock }> = ({ block }) => {
  return (
    <div className="my-8 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-950/30 via-[#111726] to-[#0c101a] p-6 sm:p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6 shadow-lg">
      <div className="max-w-xl">
        <h3 className="font-display text-xl font-bold text-white mb-2">{block.title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{block.description}</p>
      </div>
      <div className="mt-5 sm:mt-0 flex-shrink-0">
        <a
          href={block.buttonUrl}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-95"
        >
          <span>{block.buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export const ProsConsBlockView: React.FC<{ block: ProsConsBlock }> = ({ block }) => {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pros Column */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-5">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-emerald-500/20 text-emerald-400 font-semibold text-sm">
          <CheckSquare className="w-4 h-4" />
          <span>Key Advantages</span>
        </div>
        <ul className="space-y-2.5">
          {block.pros.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <span className="text-emerald-400 font-bold mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Column */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-5">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-rose-500/20 text-rose-400 font-semibold text-sm">
          <XSquare className="w-4 h-4" />
          <span>Trade-offs & Limits</span>
        </div>
        <ul className="space-y-2.5">
          {block.cons.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
              <span className="text-rose-400 font-bold mt-0.5">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const TakeawaysBlockView: React.FC<{ block: TakeawaysBlock }> = ({ block }) => {
  return (
    <div className="my-6 rounded-xl border border-purple-500/30 bg-purple-950/20 p-5">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-purple-500/20 text-purple-300 font-semibold text-sm">
        <List className="w-4 h-4" />
        <span>{block.title || 'Key Takeaways'}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {block.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs mt-0.5">
              {idx + 1}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TableBlockView: React.FC<{ block: TableBlock }> = ({ block }) => {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0a0e17]">
      {block.caption && (
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-medium text-slate-300">
          {block.caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-slate-200 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {block.rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-[#0a0e17]' : 'bg-[#0d131f]'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const FaqBlockView: React.FC<{ block: FaqBlock }> = ({ block }) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [block.items[0]?.id || '']: true,
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="my-8 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>Frequently Asked Questions</span>
      </h3>
      <div className="space-y-3">
        {block.items.map((item) => {
          const isOpen = !!openIds[item.id];
          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-800 bg-[#080c14] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-slate-200 hover:text-white"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ContentBlockRenderer: React.FC<{ block: SpecialContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'image':
      return <ImageBlockView block={block} />;
    case 'divider':
      return <DividerBlockView block={block} />;
    case 'prompt':
      return <PromptBlockView block={block} />;
    case 'code':
      return <CodeBlockView block={block} />;
    case 'info':
    case 'warning':
    case 'important':
    case 'tip':
      return <CalloutBlockView block={block} />;
    case 'cta':
      return <CtaBlockView block={block} />;
    case 'pros_cons':
      return <ProsConsBlockView block={block} />;
    case 'takeaways':
      return <TakeawaysBlockView block={block} />;
    case 'table':
      return <TableBlockView block={block} />;
    case 'faq':
      return <FaqBlockView block={block} />;
    case 'toc':
      return null; // Rendered in dedicated TOC sidebar/anchor
    default:
      return null;
  }
};
