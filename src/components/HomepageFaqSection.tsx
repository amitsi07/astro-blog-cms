import React, { useState } from 'react';
import { usePrompts } from '../context/PromptContext';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const HomepageFaqSection: React.FC = () => {
  const { customizerSettings } = usePrompts();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true
  });

  if (!customizerSettings?.faqSection?.enabled) return null;

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqItems = customizerSettings?.faqSection?.items || [];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1d202e]">
      
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{customizerSettings?.faqSection?.badge || 'FAQ'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          {customizerSettings?.faqSection?.title || 'Frequently Asked Questions'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {customizerSettings?.faqSection?.subtitle || ''}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqItems.map((item) => {
          const isOpen = openIds[item.id];
          return (
            <div
              key={item.id}
              className="bg-[#131522] border border-[#23273a] hover:border-[#383e5a] rounded-xl overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-white hover:text-violet-300 transition-colors cursor-pointer"
              >
                <span className="pr-4">{item.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-[#1d202e] pt-3.5">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
