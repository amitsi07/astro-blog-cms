import { GutenbergBlock, BlockType } from '../types/blocks';

// Convert raw text/markdown into an initial array of structured Gutenberg blocks
export function parseContentToBlocks(rawContent: string): GutenbergBlock[] {
  if (!rawContent || !rawContent.trim()) {
    return [createDefaultBlock('paragraph')];
  }

  // If already JSON stringified blocks
  if (rawContent.trim().startsWith('[') && rawContent.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        return parsed;
      }
    } catch {
      // fallback to parser
    }
  }

  const blocks: GutenbergBlock[] = [];
  const lines = rawContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Divider
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'divider',
        style: 'solid'
      });
      i++;
      continue;
    }

    // Callout Box
    if (line.trim().startsWith(':::')) {
      const calloutType = line.trim().replace(':::', '').toLowerCase() as 'info' | 'warning' | 'tip' | 'danger' | 'faq';
      i++;
      const innerLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        innerLines.push(lines[i]);
        i++;
      }
      i++; // skip closing :::

      if (calloutType === 'faq') {
        const items: { question: string; answer: string }[] = [];
        let currQ = '';
        let currA = '';
        innerLines.forEach(l => {
          if (l.startsWith('Q:')) {
            if (currQ) items.push({ question: currQ, answer: currA.trim() });
            currQ = l.replace('Q:', '').trim();
            currA = '';
          } else if (l.startsWith('A:')) {
            currA = l.replace('A:', '').trim();
          } else if (currQ) {
            currA += ' ' + l;
          }
        });
        if (currQ) items.push({ question: currQ, answer: currA.trim() });

        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'faq',
          items: items.length > 0 ? items : [{ question: 'Sample Question?', answer: 'Sample Answer.' }]
        });
      } else {
        blocks.push({
          id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'callout',
          calloutType: (['info', 'warning', 'tip', 'danger'].includes(calloutType) ? calloutType : 'info') as any,
          content: innerLines.join('\n')
        });
      }
      continue;
    }

    // Video / YouTube URL
    if (line.includes('youtube.com/watch?v=') || line.includes('youtu.be/')) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'video',
        url: line.trim(),
        aspectRatio: '16:9'
      });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'heading',
        level: 1,
        content: line.replace('# ', '')
      });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'heading',
        level: 2,
        content: line.replace('## ', '')
      });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'heading',
        level: 3,
        content: line.replace('### ', '')
      });
      i++;
      continue;
    }

    // Code Block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace('```', '') || 'typescript';
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'code',
        language: lang,
        code: codeLines.join('\n')
      });
      continue;
    }

    // Quote
    if (line.startsWith('> ')) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'quote',
        quote: line.replace('> ', ''),
        citation: ''
      });
      i++;
      continue;
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'list',
        ordered: false,
        items: listItems
      });
      continue;
    }

    // Default Paragraph
    if (line.trim()) {
      blocks.push({
        id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'paragraph',
        content: line
      });
    }
    i++;
  }

  return blocks.length > 0 ? blocks : [createDefaultBlock('paragraph')];
}

// Convert Gutenberg Blocks array back to Markdown/HTML string
export function serializeBlocksToMarkdown(blocks: GutenbergBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level);
        return `${hashes} ${block.content}`;
      }
      case 'paragraph':
        return block.content;
      case 'divider':
        return '---';
      case 'spacer':
        return `<div style="height: ${block.height}px;"></div>`;
      case 'callout':
        return `:::${block.calloutType}\n${block.content}\n:::`;
      case 'faq':
        return `:::faq\n${block.items.map(it => `Q: ${it.question}\nA: ${it.answer}`).join('\n')}\n:::`;
      case 'video':
        return block.url;
      case 'image':
        return `![${block.alt || block.caption || 'image'}](${block.url})\n*${block.caption || ''}*`;
      case 'gallery':
        return block.images.map(img => `![${img.alt || 'gallery'}](${img.url})`).join('\n');
      case 'quote':
        return `> ${block.quote}${block.citation ? `\n> — *${block.citation}*` : ''}`;
      case 'list':
        return block.items.map(it => `- ${it}`).join('\n');
      case 'code':
        return `\`\`\`${block.language || ''}\n${block.code}\n\`\`\``;
      case 'table': {
        const headerRow = `| ${block.headers.join(' | ')} |`;
        const divRow = `| ${block.headers.map(() => '---').join(' | ')} |`;
        const bodyRows = block.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
        return `${headerRow}\n${divRow}\n${bodyRows}`;
      }
      case 'buttons':
        return block.buttons.map(b => `[${b.text}](${b.url})`).join('  ');
      case 'html':
        return block.rawHtml;
      case 'audio':
        return `<audio controls src="${block.url}"></audio>`;
      case 'columns':
        return block.columnsContent.join('\n\n---\n\n');
      case 'embed':
        return `<iframe src="${block.embedUrl}"></iframe>`;
      case 'prompt':
        return `**AI Prompt:** \`${block.promptFormula}\``;
      default:
        return '';
    }
  }).join('\n\n');
}

export function createDefaultBlock(type: BlockType): GutenbergBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, content: 'New Section Heading', align: 'left' };
    case 'image':
      return { id, type: 'image', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80', caption: 'Sample image caption', alt: 'Sample image', align: 'center', rounded: true };
    case 'gallery':
      return { id, type: 'gallery', columns: 3, images: [
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', caption: 'Portrait 1' },
        { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', caption: 'Tokyo Night' },
        { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', caption: 'Code & Studio' }
      ] };
    case 'video':
      return { id, type: 'video', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', caption: 'Video Tutorial', aspectRatio: '16:9' };
    case 'audio':
      return { id, type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', title: 'Acoustic Soundscape', artist: 'PromptPlum Studio' };
    case 'quote':
      return { id, type: 'quote', quote: 'Design is not just what it looks like and feels like. Design is how it works.', citation: 'Steve Jobs', style: 'standard' };
    case 'list':
      return { id, type: 'list', ordered: false, items: ['First key insight', 'Second critical formula', 'Third recommended practice'] };
    case 'buttons':
      return { id, type: 'buttons', align: 'left', buttons: [
        { id: 'btn-1', text: 'Get Started Now', url: '#explore', style: 'primary' },
        { id: 'btn-2', text: 'Documentation', url: '#docs', style: 'secondary' }
      ] };
    case 'columns':
      return { id, type: 'columns', columnsCount: 2, columnsContent: ['Left column text with analysis and camera settings.', 'Right column text with lighting breakdowns and lens specs.'] };
    case 'table':
      return { id, type: 'table', headers: ['Parameter', 'Optimal Value', 'Effect'], rows: [
        ['Focal Length', '85mm Prime', 'Flattering facial compression'],
        ['Aperture', 'f/1.4 - f/2.0', 'Creamy optical background bokeh'],
        ['Lighting', 'Low-angle Rim Light', 'Natural golden hour hair accents']
      ] };
    case 'code':
      return { id, type: 'code', language: 'typescript', code: '// Astro Content Collections\nexport const collections = {\n  prompts: defineCollection({ type: "content" })\n};' };
    case 'html':
      return { id, type: 'html', rawHtml: '<div class="p-4 bg-violet-950/40 rounded-xl border border-violet-800/40 text-violet-200">Custom HTML Container</div>' };
    case 'embed':
      return { id, type: 'embed', embedUrl: 'https://codepen.io' };
    case 'spacer':
      return { id, type: 'spacer', height: 40 };
    case 'divider':
      return { id, type: 'divider', style: 'solid' };
    case 'callout':
      return { id, type: 'callout', calloutType: 'info', content: 'Here is a helpful note regarding prompt parameters and styling options.' };
    case 'faq':
      return { id, type: 'faq', items: [
        { question: 'How do I customize variable tokens?', answer: 'Click Customize on any card to test subject and lighting variations.' },
        { question: 'How does Cloudflare auto-deploy work?', answer: 'Clicking Publish dispatches a webhook to Cloudflare Pages to rebuild static Astro HTML.' }
      ] };
    case 'prompt':
      return { id, type: 'prompt', model: 'Midjourney v6', aspectRatio: '3:4', promptFormula: 'Cinematic 85mm portrait of [Subject] with natural skin texture, soft [Lighting] --ar 3:4', lighting: 'Low-angle golden hour rim light', lens: '85mm f/1.4' };
    case 'paragraph':
    default:
      return { id, type: 'paragraph', content: 'Start writing your story, masterclass analysis, or prompt formulation here...', align: 'left', fontSize: 'base' };
  }
}
