import React, { useState } from 'react';
import { 
  Info, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Copy, 
  Check, 
  HelpCircle,
  ExternalLink,
  Volume2,
  FileCode,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface RichContentRendererProps {
  content: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content }) => {
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Record<string, boolean>>({
    '0': true // first FAQ open by default
  });

  const toggleFaq = (idxStr: string) => {
    setOpenFaqIndexes((prev) => ({
      ...prev,
      [idxStr]: !prev[idxStr]
    }));
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockId(id);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  if (!content) return null;

  // Extract YouTube video ID helper
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Process and tokenize lines/blocks
  const renderFormattedContent = () => {
    const sections: React.ReactNode[] = [];
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Horizontal Rule (`---` or `***` or `:::divider`)
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === ':::divider') {
        sections.push(
          <div key={`hr-${i}`} className="my-8 border-t border-[#232738]" />
        );
        i++;
        continue;
      }

      // 2. Spacer (`:::spacer height=32`)
      if (line.trim().startsWith(':::spacer')) {
        const heightMatch = line.match(/height=(\d+)/);
        const height = heightMatch ? parseInt(heightMatch[1], 10) : 32;
        sections.push(
          <div key={`spacer-${i}`} style={{ height: `${height}px` }} className="w-full" />
        );
        i++;
        continue;
      }

      // 3. Callout Boxes (`:::info`, `:::warning`, `:::tip`, `:::danger` with optional title)
      if (
        line.trim().startsWith(':::info') || 
        line.trim().startsWith(':::warning') || 
        line.trim().startsWith(':::tip') || 
        line.trim().startsWith(':::danger')
      ) {
        const calloutType = line.trim().split(' ')[0].replace(':::', '').toLowerCase();
        const customTitleMatch = line.trim().replace(/^:::[a-z]+\s*/, '');
        i++;
        const calloutLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          calloutLines.push(lines[i]);
          i++;
        }
        i++; // skip closing :::

        const calloutText = calloutLines.join('\n');

        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        let borderBg = 'bg-blue-950/20 border-blue-800/40 text-blue-200';
        let defaultTitle = 'Information Note';

        if (calloutType === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderBg = 'bg-amber-950/20 border-amber-800/40 text-amber-200';
          defaultTitle = 'Warning & Attention';
        } else if (calloutType === 'tip') {
          icon = <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderBg = 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200';
          defaultTitle = 'Pro Tip & Recommendation';
        } else if (calloutType === 'danger') {
          icon = <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />;
          borderBg = 'bg-rose-950/20 border-rose-800/40 text-rose-200';
          defaultTitle = 'Important Caution';
        }

        const titleToUse = customTitleMatch.trim() || defaultTitle;

        sections.push(
          <div key={`callout-${i}`} className={`my-6 p-4 sm:p-5 rounded-xl border ${borderBg} flex flex-col sm:flex-row items-start gap-3.5 shadow-sm`}>
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-xs sm:text-sm leading-relaxed space-y-1.5">
              {titleToUse && (
                <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                  {titleToUse}
                </h5>
              )}
              {calloutText.split('\n').map((cl, idx) => (
                <p key={idx} className="my-0.5" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cl) }} />
              ))}
            </div>
          </div>
        );
        continue;
      }

      // 4. FAQ Accordion Block (`:::faq`)
      if (line.trim().startsWith(':::faq')) {
        i++;
        const faqLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          faqLines.push(lines[i]);
          i++;
        }
        i++; // skip closing :::

        const parsedFaqs: { q: string; a: string }[] = [];
        let currentQ = '';
        let currentA = '';

        faqLines.forEach((fl) => {
          if (fl.startsWith('Q:') || fl.startsWith('Question:')) {
            if (currentQ) parsedFaqs.push({ q: currentQ, a: currentA.trim() });
            currentQ = fl.replace(/^Q:\s*|^Question:\s*/, '');
            currentA = '';
          } else if (fl.startsWith('A:') || fl.startsWith('Answer:')) {
            currentA = fl.replace(/^A:\s*|^Answer:\s*/, '');
          } else if (currentQ) {
            currentA += ' ' + fl;
          }
        });
        if (currentQ) parsedFaqs.push({ q: currentQ, a: currentA.trim() });

        sections.push(
          <div key={`faq-block-${i}`} className="my-8 space-y-3 bg-[#131522] border border-[#262a3e] rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-violet-400" />
              <span>Frequently Asked Questions</span>
            </h4>
            <div className="divide-y divide-[#222538]">
              {parsedFaqs.map((faq, idx) => {
                const isOpen = openFaqIndexes[String(idx)];
                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleFaq(String(idx))}
                      className="w-full flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-white hover:text-violet-300 transition-colors cursor-pointer py-1"
                    >
                      <span className="pr-4">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-2 border-l-2 border-violet-500/60">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        continue;
      }

      // 5. Gallery Block (`:::gallery`)
      if (line.trim().startsWith(':::gallery')) {
        const colsMatch = line.match(/cols=(\d)/);
        const cols = colsMatch ? parseInt(colsMatch[1], 10) : 3;
        i++;
        const galleryLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          if (lines[i].trim()) galleryLines.push(lines[i].trim());
          i++;
        }
        i++; // skip closing :::

        const images = galleryLines.map(l => {
          const match = l.match(/!\[(.*?)\]\((.*?)\)/);
          if (match) return { alt: match[1], url: match[2] };
          return { alt: 'Gallery Image', url: l };
        });

        sections.push(
          <div key={`gallery-${i}`} className={`my-8 grid gap-4 ${cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
            {images.map((img, gIdx) => (
              <div key={gIdx} className="group relative rounded-xl overflow-hidden border border-[#232738] bg-[#0f111a] aspect-square">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                {img.alt && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-[11px] text-slate-200">
                    {img.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        continue;
      }

      // 6. Buttons / CTA Block (`:::button text="..." url="..."`)
      if (line.trim().startsWith(':::button')) {
        const textMatch = line.match(/text="([^"]+)"/);
        const urlMatch = line.match(/url="([^"]+)"/);
        const variantMatch = line.match(/variant="([^"]+)"/);
        const text = textMatch ? textMatch[1] : 'Click Here';
        const url = urlMatch ? urlMatch[1] : '#';
        const variant = variantMatch ? variantMatch[1] : 'primary';

        sections.push(
          <div key={`btn-${i}`} className="my-6">
            <a
              href={url}
              target={url.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md ${
                variant === 'outline'
                  ? 'border border-violet-500 text-violet-300 hover:bg-violet-600/20'
                  : variant === 'secondary'
                  ? 'bg-[#222638] text-white hover:bg-[#2c324a]'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40'
              }`}
            >
              <span>{text}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        );
        i++;
        continue;
      }

      // 7. Multi-column Cards (`:::columns`)
      if (line.trim().startsWith(':::columns')) {
        i++;
        const colLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          colLines.push(lines[i]);
          i++;
        }
        i++; // skip closing :::
        const colsContent = colLines.join('\n').split('---');

        sections.push(
          <div key={`cols-${i}`} className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {colsContent.map((col, cIdx) => (
              <div key={cIdx} className="bg-[#141624] border border-[#242738] rounded-xl p-5 space-y-2 text-xs sm:text-sm text-slate-300">
                {col.split('\n').filter(l => l.trim()).map((cl, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cl) }} />
                ))}
              </div>
            ))}
          </div>
        );
        continue;
      }

      // 8. Audio Player (`:::audio url="..." title="..."`)
      if (line.trim().startsWith(':::audio')) {
        const urlMatch = line.match(/url="([^"]+)"/);
        const titleMatch = line.match(/title="([^"]+)"/);
        const audioUrl = urlMatch ? urlMatch[1] : '';
        const audioTitle = titleMatch ? titleMatch[1] : 'Audio Preview';

        sections.push(
          <div key={`audio-${i}`} className="my-6 bg-[#141624] border border-[#262a3e] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-white text-xs sm:text-sm truncate">{audioTitle}</h5>
              <audio controls src={audioUrl} className="w-full mt-2 h-8" />
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 9. Markdown Tables (`| col | col |`)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        const parseRow = (rowStr: string) => 
          rowStr.split('|').slice(1, -1).map(c => c.trim());

        const headers = parseRow(tableLines[0]);
        const isDivider = tableLines[1] && tableLines[1].includes('---');
        const rowStartIndex = isDivider ? 2 : 1;
        const rows = tableLines.slice(rowStartIndex).map(parseRow);

        sections.push(
          <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-[#25283c] bg-[#121420] shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#181b2a] border-b border-[#25283c] text-slate-200">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-violet-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202334]">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#161928] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-300">
                        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // 10. Standalone YouTube Link Embed
      const ytId = getYouTubeId(line.trim());
      if (ytId && (line.trim().startsWith('http://') || line.trim().startsWith('https://'))) {
        sections.push(
          <div key={`yt-${i}`} className="my-8 rounded-xl overflow-hidden border border-[#272b3e] shadow-2xl bg-black">
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title="YouTube Video Embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="bg-[#141624] px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Play className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube Video Tutorial</span>
              </span>
              <a
                href={line.trim()}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 11. Code Block (```...```)
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace('```', '') || 'code';
        i++;
        const codeLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const rawCode = codeLines.join('\n');
        const blockId = `code-${i}`;

        sections.push(
          <div key={blockId} className="my-6 rounded-xl overflow-hidden border border-[#262a3c] bg-[#0c0d14] shadow-lg font-mono text-xs">
            <div className="bg-[#151724] px-4 py-2 flex items-center justify-between border-b border-[#232738] text-slate-400 text-[11px]">
              <span className="uppercase font-semibold text-slate-300">{lang}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(rawCode, blockId)}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedBlockId === blockId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBlockId === blockId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed">
              <code>{rawCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 12. Headings (H1 to H6)
      if (line.startsWith('###### ')) {
        sections.push(
          <h6 key={`h6-${i}`} className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">
            {line.replace('###### ', '')}
          </h6>
        );
        i++;
        continue;
      }
      if (line.startsWith('##### ')) {
        sections.push(
          <h5 key={`h5-${i}`} className="text-sm font-bold text-slate-300 mt-5 mb-2">
            {line.replace('##### ', '')}
          </h5>
        );
        i++;
        continue;
      }
      if (line.startsWith('#### ')) {
        sections.push(
          <h4 key={`h4-${i}`} className="text-base font-bold text-white mt-6 mb-2">
            {line.replace('#### ', '')}
          </h4>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        sections.push(
          <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-white tracking-tight mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        sections.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-8 mb-4 border-b border-[#232738] pb-2">
            {line.replace('## ', '')}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('# ')) {
        sections.push(
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-8 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
        i++;
        continue;
      }

      // 13. Blockquotes (`> ...`)
      if (line.startsWith('> ')) {
        const quoteText = line.replace('> ', '');
        sections.push(
          <blockquote key={`quote-${i}`} className="my-6 pl-4 border-l-4 border-violet-500 italic text-slate-200 text-sm sm:text-base leading-relaxed bg-[#131522]/50 p-3 rounded-r-xl">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(quoteText) }} />
          </blockquote>
        );
        i++;
        continue;
      }

      // 14. Bullet Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        sections.push(
          <li key={`li-${i}`} className="text-xs sm:text-sm text-slate-300 ml-4 list-disc my-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.slice(2)) }} />
        );
        i++;
        continue;
      }

      // 15. Numbered Lists
      if (/^\d+\.\s/.test(line)) {
        sections.push(
          <div key={`ol-${i}`} className="text-xs sm:text-sm text-slate-300 my-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        );
        i++;
        continue;
      }

      // 16. Standard Paragraphs
      if (line.trim()) {
        sections.push(
          <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-3 font-normal" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        );
      }

      i++;
    }

    return sections;
  };

  return <div className="space-y-1">{renderFormattedContent()}</div>;
};

// Simple inline markdown formatter for **bold**, *italic*, `code`, and [link](url)
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-200 italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#1c1f2e] text-violet-300 font-mono text-[11px] border border-[#2b2f44]">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-violet-400 hover:text-violet-300 underline underline-offset-2">$1</a>');
}
