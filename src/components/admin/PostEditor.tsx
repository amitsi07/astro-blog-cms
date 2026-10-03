import React, { useState, useEffect, useRef } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { 
  PostItem, 
  AIModel, 
  AspectRatio, 
  PostType, 
  PostStatus,
  EditorBlock,
  EditorBlockType 
} from '../../types/prompt';
import { RichContentRenderer } from '../RichContentRenderer';
import { 
  Save, 
  Rocket, 
  Eye, 
  ArrowLeft, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  Lightbulb, 
  Youtube, 
  HelpCircle, 
  Minus, 
  Table as TableIcon, 
  Heading1, 
  Heading2, 
  Heading3,
  Bold, 
  Italic, 
  Code, 
  Quote, 
  List, 
  Columns, 
  Maximize2, 
  Check, 
  Layers, 
  FileText,
  Sliders,
  Globe,
  Tag,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Volume2,
  Play,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  FileCode,
  LayoutGrid,
  Upload,
  FolderOpen,
  UploadCloud,
  CheckCircle2,
  X
} from 'lucide-react';

interface PostEditorProps {
  postId: string | null;
  onClose: () => void;
}

const MODELS: AIModel[] = [
  'Midjourney v6',
  'Flux.1',
  'Gemini / Imagen 3',
  'ChatGPT / DALL·E 3',
  'Stable Diffusion XL'
];

const RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4', '4:5'];

// Convert raw markdown/text to visual blocks
function parseContentToBlocks(raw: string): EditorBlock[] {
  if (!raw.trim()) {
    return [
      { id: 'b-init-1', type: 'heading', level: 2, content: 'Introduction' },
      { id: 'b-init-2', type: 'paragraph', content: 'Write your content here...' }
    ];
  }

  const blocks: EditorBlock[] = [];
  const lines = raw.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Divider
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === ':::divider') {
      blocks.push({ id: `block-${Date.now()}-${i}`, type: 'divider' });
      i++;
      continue;
    }

    // Callout
    if (line.trim().startsWith(':::info') || line.trim().startsWith(':::warning') || line.trim().startsWith(':::tip') || line.trim().startsWith(':::danger')) {
      const type = line.trim().split(' ')[0].replace(':::', '').toLowerCase() as any;
      const title = line.trim().replace(/^:::[a-z]+\s*/, '');
      i++;
      const cLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        cLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'callout',
        calloutType: type,
        calloutTitle: title,
        content: cLines.join('\n')
      });
      continue;
    }

    // FAQ
    if (line.trim().startsWith(':::faq')) {
      i++;
      const fLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        fLines.push(lines[i]);
        i++;
      }
      i++;
      const faqs: { question: string; answer: string }[] = [];
      let curQ = '';
      let curA = '';
      fLines.forEach(fl => {
        if (fl.startsWith('Q:') || fl.startsWith('Question:')) {
          if (curQ) faqs.push({ question: curQ, answer: curA.trim() });
          curQ = fl.replace(/^Q:\s*|^Question:\s*/, '');
          curA = '';
        } else if (fl.startsWith('A:') || fl.startsWith('Answer:')) {
          curA = fl.replace(/^A:\s*|^Answer:\s*/, '');
        } else if (curQ) {
          curA += ' ' + fl;
        }
      });
      if (curQ) faqs.push({ question: curQ, answer: curA.trim() });

      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'faq',
        faqItems: faqs.length ? faqs : [{ question: 'FAQ Question?', answer: 'FAQ Answer' }]
      });
      continue;
    }

    // Gallery
    if (line.trim().startsWith(':::gallery')) {
      i++;
      const gLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        if (lines[i].trim()) gLines.push(lines[i].trim());
        i++;
      }
      i++;
      const imgs = gLines.map(l => ({ url: l.replace(/!\[.*?\]\((.*?)\)/, '$1') }));
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'gallery',
        images: imgs.length ? imgs : [{ url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' }]
      });
      continue;
    }

    // Code
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace('```', '') || 'typescript';
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'code',
        codeLanguage: lang,
        content: codeLines.join('\n')
      });
      continue;
    }

    // YouTube
    const isYt = (line.includes('youtube.com') || line.includes('youtu.be')) && (line.startsWith('http://') || line.startsWith('https://'));
    if (isYt) {
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'video',
        url: line.trim()
      });
      i++;
      continue;
    }

    // Heading
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        blocks.push({
          id: `block-${Date.now()}-${i}`,
          type: 'heading',
          level: match[1].length as any,
          content: match[2]
        });
        i++;
        continue;
      }
    }

    // Quote
    if (line.startsWith('> ')) {
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'quote',
        content: line.replace('> ', '')
      });
      i++;
      continue;
    }

    // Paragraph (accumulate consecutive non-empty lines)
    if (line.trim()) {
      blocks.push({
        id: `block-${Date.now()}-${i}`,
        type: 'paragraph',
        content: line
      });
    }

    i++;
  }

  return blocks.length ? blocks : [{ id: 'b-1', type: 'paragraph', content: raw }];
}

// Convert visual blocks back to standard markdown/content string
function serializeBlocksToContent(blocks: EditorBlock[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level || 2);
        return `${hashes} ${block.content || ''}`;
      }
      case 'paragraph':
        return block.content || '';
      case 'quote':
        return `> ${block.content || ''}${block.quoteAuthor ? ` — ${block.quoteAuthor}` : ''}`;
      case 'divider':
        return '---';
      case 'spacer':
        return `:::spacer height=${block.spacerHeight || 32}`;
      case 'callout':
        return `:::${block.calloutType || 'info'}${block.calloutTitle ? ' ' + block.calloutTitle : ''}\n${block.content || ''}\n:::`;
      case 'faq':
        return `:::faq\n${(block.faqItems || []).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}\n:::`;
      case 'gallery':
        return `:::gallery cols=${block.galleryCols || 3}\n${(block.images || []).map(img => img.url).join('\n')}\n:::`;
      case 'video':
      case 'embed':
        return block.url || '';
      case 'audio':
        return `:::audio url="${block.url || ''}" title="${block.caption || 'Audio Track'}"`;
      case 'buttons':
        return `:::button text="${block.buttons?.[0]?.text || 'Click Here'}" url="${block.buttons?.[0]?.url || '#'}" variant="${block.buttons?.[0]?.variant || 'primary'}"`;
      case 'code':
        return `\`\`\`${block.codeLanguage || 'code'}\n${block.content || ''}\n\`\`\``;
      case 'table':
        return `| Parameter | Value | Details |\n| :--- | :--- | :--- |\n| Setting 1 | High Quality | Studio lighting |`;
      case 'image':
        return `![${block.alt || 'Image'}](${block.url || ''})\n*${block.caption || ''}*`;
      default:
        return block.content || '';
    }
  }).join('\n\n');
}

export const PostEditor: React.FC<PostEditorProps> = ({ postId, onClose }) => {
  const { 
    posts, 
    categories, 
    mediaList, 
    addMedia,
    saveDraft, 
    publishPost, 
    setEditingPostId,
    isBuilding, 
    showToast 
  } = usePrompts();

  const existingPost = posts.find((p) => p.id === postId);

  // Form states
  const [title, setTitle] = useState(existingPost?.title || '');
  const [slug, setSlug] = useState(existingPost?.slug || '');
  const [type, setType] = useState<PostType>(existingPost?.type || 'prompt');
  const [status, setStatus] = useState<PostStatus>(existingPost?.status || 'draft');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
  const [content, setContent] = useState(existingPost?.content || '');
  
  // Gutenberg Visual Blocks State
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseContentToBlocks(existingPost?.content || ''));
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  // File Upload and Media Picker states
  const featuredFileInputRef = useRef<HTMLInputElement>(null);
  const blockFileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [targetBlockIdx, setTargetBlockIdx] = useState<number | null>(null);

  const SAMPLE_PRESET_IMAGES = [
    { name: '85mm Portrait', url: '/images/cinematic_portrait_1790912658842.jpg' },
    { name: 'Cyberpunk Tokyo', url: '/images/cyberpunk_tokyo_1790912672961.jpg' },
    { name: 'Fashion Editorial', url: '/images/fashion_editorial_1790912686462.jpg' },
    { name: 'Fantasy Island', url: '/images/fantasy_landscape_1790912697089.jpg' },
  ];

  const handleFeaturedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      addMedia({
        name: file.name,
        url: dataUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dimensions: 'Original',
        mimeType: file.type || 'image/jpeg'
      });
      showToast(`Uploaded "${file.name}" as featured image`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBlockImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, blockIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const targetBlock = blocks[blockIdx];
      if (targetBlock.type === 'gallery') {
        const newImages = [...(targetBlock.images || []), { url: dataUrl, caption: file.name }];
        updateBlockData(blockIdx, { images: newImages });
      } else {
        updateBlockData(blockIdx, { url: dataUrl, caption: file.name });
      }
      addMedia({
        name: file.name,
        url: dataUrl,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        dimensions: 'Original',
        mimeType: file.type || 'image/jpeg'
      });
      showToast(`Uploaded "${file.name}" to content block`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // AI Prompt specific states
  const [model, setModel] = useState<AIModel>(existingPost?.model || 'Midjourney v6');
  const [category, setCategory] = useState(existingPost?.category || 'Portraits');
  const [image, setImage] = useState(existingPost?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(existingPost?.aspectRatio || '3:4');
  const [prompt, setPrompt] = useState(existingPost?.prompt || 'Cinematic 85mm portrait of [Subject], soft studio lighting, editorial grade --ar 3:4');
  const [negativePrompt, setNegativePrompt] = useState(existingPost?.negativePrompt || '');
  const [tagsStr, setTagsStr] = useState(existingPost?.tags?.join(', ') || '85mm, Portrait, Editorial');
  
  // Settings & Variables
  const [stylize, setStylize] = useState(existingPost?.settings?.stylize || '250');
  const [lighting, setLighting] = useState(existingPost?.settings?.lighting || 'Low-angle golden hour rim light');
  const [lens, setLens] = useState(existingPost?.settings?.lens || '85mm f/1.4 lens');
  const [variablesJson, setVariablesJson] = useState(
    JSON.stringify(
      existingPost?.variables || [
        {
          name: 'Subject',
          token: '[Subject]',
          defaultValue: 'a serene woman with subtle freckles',
          options: ['a serene woman with subtle freckles', 'an elder craftsman with silver beard']
        }
      ],
      null,
      2
    )
  );

  // SEO Settings
  const [metaTitle, setMetaTitle] = useState(existingPost?.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(existingPost?.seo?.metaDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(existingPost?.seo?.focusKeyword || '');

  // Editor View Modes (Standard vs Split Screen Preview)
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sidebarTab, setSidebarTab] = useState<'document' | 'block' | 'seo'>('document');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Sync blocks to content string
  const updateBlocksAndContent = (newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks);
    const newContent = serializeBlocksToContent(newBlocks);
    setContent(newContent);
  };

  // Sync content string to blocks
  const handleContentCodeChange = (val: string) => {
    setContent(val);
    setBlocks(parseContentToBlocks(val));
  };

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!existingPost || !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const getFormData = (forceStatus?: PostStatus): Partial<PostItem> => {
    let parsedVars = [];
    try {
      if (variablesJson.trim()) {
        parsedVars = JSON.parse(variablesJson);
      }
    } catch {
      // ignore
    }

    const finalContent = editorMode === 'visual' ? serializeBlocksToContent(blocks) : content;

    return {
      id: existingPost?.id || undefined,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      type,
      status: forceStatus || status,
      excerpt: excerpt || finalContent.slice(0, 140),
      content: finalContent,
      blocks,
      model: type === 'prompt' ? model : undefined,
      category,
      image,
      aspectRatio: type === 'prompt' ? aspectRatio : undefined,
      prompt: type === 'prompt' ? prompt : undefined,
      negativePrompt: negativePrompt || undefined,
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      settings: {
        stylize: stylize || undefined,
        lighting: lighting || undefined,
        lens: lens || undefined
      },
      variables: parsedVars,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        focusKeyword
      }
    };
  };

  // 1. SAVE DRAFT (WordPress Workflow: NO build triggered)
  const handleSaveDraft = () => {
    if (!title.trim()) {
      showToast('Please enter a post title');
      return;
    }
    setIsSaving(true);
    const data = getFormData('draft');
    const saved = saveDraft(data);
    if (saved?.id) {
      setEditingPostId(saved.id);
    }
    setStatus('draft');
    setLastSavedTime(new Date().toLocaleTimeString());
    setTimeout(() => setIsSaving(false), 400);
  };

  // 2. PUBLISH / UPDATE & DEPLOY (WordPress Workflow: Triggers Cloudflare Deploy!)
  const handlePublish = async (shouldClose: boolean = false) => {
    if (!title.trim()) {
      showToast('Please enter a post title');
      return;
    }
    let currentPrompt = prompt;
    if (type === 'prompt' && !currentPrompt.trim()) {
      currentPrompt = title;
      setPrompt(title);
    }

    setIsSaving(true);
    const data = getFormData('published');
    if (type === 'prompt') {
      data.prompt = currentPrompt;
    }

    const published = await publishPost(data);
    if (published?.id) {
      setEditingPostId(published.id);
    }
    setStatus('published');
    setLastSavedTime(new Date().toLocaleTimeString());
    setIsSaving(false);

    if (shouldClose) {
      onClose();
    }
  };

  // Block Manipulation Helpers
  const addBlock = (newBlock: EditorBlock) => {
    let newBlocks = [...blocks];
    if (insertIndex !== null && insertIndex >= 0) {
      newBlocks.splice(insertIndex + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    updateBlocksAndContent(newBlocks);
    setShowBlockPicker(false);
    setInsertIndex(null);
    showToast(`Added ${newBlock.type} block`);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);
    updateBlocksAndContent(newBlocks);
  };

  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const dup: EditorBlock = {
      ...JSON.parse(JSON.stringify(original)),
      id: `block-${Date.now()}-${Math.random()}`
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, dup);
    updateBlocksAndContent(newBlocks);
    showToast('Block duplicated');
  };

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, idx) => idx !== index);
    updateBlocksAndContent(newBlocks);
  };

  const updateBlockData = (index: number, patch: Partial<EditorBlock>) => {
    const newBlocks = blocks.map((b, idx) => (idx === index ? { ...b, ...patch } : b));
    updateBlocksAndContent(newBlocks);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full bg-[#11131c] text-slate-200 overflow-hidden font-sans">
      
      {/* WordPress Gutenberg Top Bar */}
      <div className="h-14 bg-[#181a24] border-b border-[#242738] px-3 sm:px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#202334] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Back to All Posts"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs truncate">
            <span className="font-semibold text-white truncate">
              {existingPost ? 'Edit Post' : 'Add New Post'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
              status === 'published' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
            }`}>
              {status}
            </span>
            {lastSavedTime && (
              <span className="text-[11px] text-slate-500 hidden md:inline">
                Saved at {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        {/* View mode toggle: Visual Editor vs Code vs Split vs Preview */}
        <div className="flex items-center gap-1">
          
          <div className="hidden lg:flex items-center bg-[#10121a] p-0.5 rounded-lg border border-[#242738] text-xs">
            <button
              onClick={() => { setEditorMode('visual'); setViewMode('editor'); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                editorMode === 'visual' && viewMode !== 'preview' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Gutenberg Blocks</span>
            </button>
            <button
              onClick={() => { setEditorMode('code'); setViewMode('editor'); }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                editorMode === 'code' && viewMode !== 'preview' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown Code</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'preview' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Action Buttons: Save Draft, Publish */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. SAVE DRAFT BUTTON (NO BUILD TRIGGERED) */}
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#222638] hover:bg-[#2c324a] rounded-lg border border-[#2e334d] transition-colors cursor-pointer disabled:opacity-50"
              title="Save as Draft (Does NOT trigger Cloudflare build)"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {/* 2. PUBLISH / UPDATE & DEPLOY BUTTON (TRIGGERS CLOUDFLARE BUILD) */}
            <button
              onClick={() => handlePublish(false)}
              disabled={isSaving || isBuilding}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer ${
                status === 'published'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40'
              }`}
              title="Publish and keep editing"
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>{status === 'published' ? 'Update & Deploy' : 'Publish to Live'}</span>
                </>
              )}
            </button>

            {/* 3. PUBLISH & EXIT BUTTON */}
            <button
              onClick={() => handlePublish(true)}
              disabled={isSaving || isBuilding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Publish post and return to All Posts"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Publish & Exit</span>
            </button>

          </div>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Center Column: Visual Blocks or Code Editor */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 ${viewMode === 'preview' ? 'hidden' : 'block'}`}>
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Post Type Selector */}
            <div className="flex items-center gap-2 p-1 bg-[#161824] rounded-lg border border-[#242738] w-fit">
              <button
                type="button"
                onClick={() => setType('prompt')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  type === 'prompt' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Photo Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setType('article')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  type === 'article' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Article / Masterclass</span>
              </button>

              <button
                type="button"
                onClick={() => setType('page')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  type === 'page' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Standard Page</span>
              </button>
            </div>

            {/* Post Title Field */}
            <div className="space-y-1">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Add title..."
                className="w-full bg-transparent text-2xl sm:text-4xl font-display font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono pt-1">
                <span>Permalink:</span>
                <span className="text-slate-400">https://your-domain.com/posts/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-[#151724] border border-[#272b3e] rounded px-1.5 py-0.5 text-violet-300 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Prompt Formulation Block (If prompt post) */}
            {type === 'prompt' && (
              <div className="bg-[#151724] border border-[#242738] rounded-xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Model Prompt Formulation</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    Use <code className="text-violet-400">[Tokens]</code> for dynamic variables
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Prompt Body *</label>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Cinematic 85mm portrait of [Subject] with soft dramatic [Lighting] --ar 3:4"
                    className="w-full bg-[#0d0e17] border border-[#292d42] rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Negative Prompt</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="over-smoothed skin, plastic look, blurry, distorted"
                    className="w-full bg-[#0d0e17] border border-[#292d42] rounded-lg px-3 py-2 text-xs text-rose-300 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Gutenberg Visual Blocks or Raw Code Editor */}
            {editorMode === 'visual' ? (
              <div className="space-y-4">
                
                <div className="flex items-center justify-between pb-2 border-b border-[#232738]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Gutenberg Visual Blocks
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 text-[10px] font-mono">
                      {blocks.length} blocks
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setInsertIndex(null); setShowBlockPicker(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Block</span>
                  </button>
                </div>

                {/* Render Each Block Card */}
                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className="group relative bg-[#151724] border border-[#242738] hover:border-violet-600/50 rounded-xl p-4 transition-all shadow-sm"
                    >
                      {/* Block Controls Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#212435] text-[11px] text-slate-400">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="w-5 h-5 rounded bg-[#1e2234] flex items-center justify-center font-bold text-violet-400 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="uppercase font-semibold text-slate-300">
                            {block.type}
                          </span>
                        </div>

                        {/* Actions: Move Up, Down, Duplicate, Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-[#202334] rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === blocks.length - 1}
                            className="p-1 hover:bg-[#202334] rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateBlock(idx)}
                            className="p-1 hover:bg-[#202334] rounded text-slate-400 hover:text-white cursor-pointer"
                            title="Duplicate Block"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(idx)}
                            className="p-1 hover:bg-rose-950/60 rounded text-rose-400 hover:text-rose-300 cursor-pointer"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Block Specific Form Fields */}
                      {block.type === 'heading' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={block.level || 2}
                              onChange={(e) => updateBlockData(idx, { level: parseInt(e.target.value, 10) as any })}
                              className="bg-[#10121b] border border-[#272a3e] rounded px-2 py-1 text-xs text-slate-200 font-mono"
                            >
                              <option value="1">H1 Heading</option>
                              <option value="2">H2 Heading</option>
                              <option value="3">H3 Heading</option>
                              <option value="4">H4 Heading</option>
                              <option value="5">H5 Heading</option>
                              <option value="6">H6 Heading</option>
                            </select>
                            <input
                              type="text"
                              value={block.content || ''}
                              onChange={(e) => updateBlockData(idx, { content: e.target.value })}
                              placeholder="Heading text..."
                              className="flex-1 bg-[#10121b] border border-[#272a3e] rounded px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-violet-500"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <textarea
                          rows={3}
                          value={block.content || ''}
                          onChange={(e) => updateBlockData(idx, { content: e.target.value })}
                          placeholder="Write paragraph text or markdown (**bold**, *italic*, `code`, [link](url))..."
                          className="w-full bg-[#10121b] border border-[#272a3e] rounded-lg p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 leading-relaxed font-sans"
                        />
                      )}

                      {block.type === 'callout' && (
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <select
                              value={block.calloutType || 'info'}
                              onChange={(e) => updateBlockData(idx, { calloutType: e.target.value as any })}
                              className="bg-[#10121b] border border-[#272a3e] rounded px-2.5 py-1 text-xs text-slate-200 font-semibold"
                            >
                              <option value="info">Info Box (Blue)</option>
                              <option value="warning">Warning Box (Amber)</option>
                              <option value="tip">Pro Tip Box (Emerald)</option>
                              <option value="danger">Danger Box (Rose)</option>
                            </select>
                            <input
                              type="text"
                              value={block.calloutTitle || ''}
                              onChange={(e) => updateBlockData(idx, { calloutTitle: e.target.value })}
                              placeholder="Optional callout header title..."
                              className="flex-1 bg-[#10121b] border border-[#272a3e] rounded px-3 py-1 text-xs text-white focus:outline-none focus:border-violet-500"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={block.content || ''}
                            onChange={(e) => updateBlockData(idx, { content: e.target.value })}
                            placeholder="Callout text body..."
                            className="w-full bg-[#10121b] border border-[#272a3e] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 leading-relaxed"
                          />
                        </div>
                      )}

                      {block.type === 'faq' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {(block.faqItems || []).map((faq, fIdx) => (
                              <div key={fIdx} className="bg-[#10121b] p-3 rounded-lg border border-[#242738] space-y-2">
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newFaqs = [...(block.faqItems || [])];
                                    newFaqs[fIdx] = { ...newFaqs[fIdx], question: e.target.value };
                                    updateBlockData(idx, { faqItems: newFaqs });
                                  }}
                                  placeholder="Question..."
                                  className="w-full bg-[#161824] border border-[#2a2e42] rounded px-2.5 py-1 text-xs font-semibold text-white focus:outline-none"
                                />
                                <textarea
                                  rows={2}
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const newFaqs = [...(block.faqItems || [])];
                                    newFaqs[fIdx] = { ...newFaqs[fIdx], answer: e.target.value };
                                    updateBlockData(idx, { faqItems: newFaqs });
                                  }}
                                  placeholder="Answer..."
                                  className="w-full bg-[#161824] border border-[#2a2e42] rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFaqs = [...(block.faqItems || []), { question: 'New Question?', answer: 'Answer details...' }];
                              updateBlockData(idx, { faqItems: newFaqs });
                            }}
                            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add FAQ Item</span>
                          </button>
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400">YouTube Video URL</label>
                          <input
                            type="text"
                            value={block.url || ''}
                            onChange={(e) => updateBlockData(idx, { url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-[#10121b] border border-[#272a3e] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      )}

                      {block.type === 'divider' && (
                        <div className="py-2 flex items-center gap-2 text-slate-500 text-xs">
                          <div className="h-px bg-slate-700 flex-1" />
                          <span>Horizontal Rule Divider</span>
                          <div className="h-px bg-slate-700 flex-1" />
                        </div>
                      )}

                      {block.type === 'quote' && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={block.content || ''}
                            onChange={(e) => updateBlockData(idx, { content: e.target.value })}
                            placeholder="Quote text..."
                            className="w-full bg-[#10121b] border border-[#272a3e] rounded-lg p-2.5 text-xs italic text-slate-200"
                          />
                          <input
                            type="text"
                            value={block.quoteAuthor || ''}
                            onChange={(e) => updateBlockData(idx, { quoteAuthor: e.target.value })}
                            placeholder="Author citation (e.g. Ansel Adams)"
                            className="w-full bg-[#10121b] border border-[#272a3e] rounded px-2.5 py-1 text-xs text-slate-400"
                          />
                        </div>
                      )}

                      {block.type === 'buttons' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={block.buttons?.[0]?.text || ''}
                            onChange={(e) => updateBlockData(idx, { buttons: [{ text: e.target.value, url: block.buttons?.[0]?.url || '#', variant: 'primary' }] })}
                            placeholder="Button Label"
                            className="bg-[#10121b] border border-[#272a3e] rounded px-3 py-1.5 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={block.buttons?.[0]?.url || ''}
                            onChange={(e) => updateBlockData(idx, { buttons: [{ text: block.buttons?.[0]?.text || 'Click Here', url: e.target.value, variant: 'primary' }] })}
                            placeholder="https://..."
                            className="bg-[#10121b] border border-[#272a3e] rounded px-3 py-1.5 text-xs text-violet-300"
                          />
                        </div>
                      )}

                      {block.type === 'code' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={block.codeLanguage || 'typescript'}
                              onChange={(e) => updateBlockData(idx, { codeLanguage: e.target.value })}
                              placeholder="Language (e.g. typescript, python, css)"
                              className="w-36 bg-[#10121b] border border-[#272a3e] rounded px-2.5 py-1 text-xs font-mono text-slate-300"
                            />
                          </div>
                          <textarea
                            rows={4}
                            value={block.content || ''}
                            onChange={(e) => updateBlockData(idx, { content: e.target.value })}
                            placeholder="// Code snippet..."
                            className="w-full bg-[#0c0d14] border border-[#272a3e] rounded-lg p-3 text-xs font-mono text-violet-300 leading-relaxed"
                          />
                        </div>
                      )}

                      {/* Inline Add Block Between */}
                      <div className="pt-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => { setInsertIndex(idx); setShowBlockPicker(true); }}
                          className="px-2.5 py-0.5 rounded-full bg-[#1c1f30] hover:bg-violet-600 text-slate-400 hover:text-white text-[11px] flex items-center gap-1 border border-[#2a2e42] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert block here</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Add Block Trigger */}
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setInsertIndex(null); setShowBlockPicker(true); }}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#242738] hover:border-violet-500 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-violet-400" />
                    <span>Click to Add Next Gutenberg Block</span>
                  </button>
                </div>

              </div>
            ) : (
              /* Raw Markdown Code Editor Mode */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Raw Markdown & Block Code Editor</span>
                  <span className="font-mono">{wordCount} words</span>
                </div>
                <textarea
                  rows={20}
                  value={content}
                  onChange={(e) => handleContentCodeChange(e.target.value)}
                  placeholder="Write full article markdown or insert Gutenberg tokens (:::info, :::warning, :::tip, :::faq, YouTube URLs, ---)..."
                  className="w-full bg-[#0d0e17] border border-[#242738] rounded-xl p-4 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono leading-relaxed shadow-inner"
                />
              </div>
            )}

          </div>
        </div>

        {/* Live Split / Full Preview Column */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'preview' ? 'w-full' : 'w-1/2 border-l border-[#242738]'} overflow-y-auto bg-[#0b0c12] p-4 sm:p-8 space-y-6 flex flex-col items-center`}>
            
            {/* Responsive Viewport Switcher */}
            <div className="flex items-center gap-2 bg-[#161824] p-1 rounded-lg border border-[#242738] text-xs mb-2">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded flex items-center gap-1.5 ${previewDevice === 'desktop' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded flex items-center gap-1.5 ${previewDevice === 'tablet' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded flex items-center gap-1.5 ${previewDevice === 'mobile' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile (375px)</span>
              </button>
            </div>

            {/* Container with responsive device sizing */}
            <div className={`w-full transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-[375px] border border-[#2b2f44] rounded-2xl p-4 bg-[#10121a] shadow-2xl' :
              previewDevice === 'tablet' ? 'max-w-[768px] border border-[#2b2f44] rounded-2xl p-6 bg-[#10121a] shadow-2xl' :
              'max-w-3xl'
            }`}>
              {/* Header Image */}
              {image && (
                <div className="rounded-xl overflow-hidden mb-6 border border-[#232738]">
                  <img src={image} alt={title} className="w-full aspect-video object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold mb-2">
                <span>{category}</span>
                <span>·</span>
                <span className="text-slate-500 font-mono">{readTime} min read</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-4">
                {title || 'Untitled Post'}
              </h1>

              {excerpt && (
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed border-l-2 border-violet-500 pl-3 mb-6 italic">
                  {excerpt}
                </p>
              )}

              {/* Render Gutenberg / Markdown formatted content */}
              <div className="border-t border-[#232738] pt-6">
                <RichContentRenderer content={editorMode === 'visual' ? serializeBlocksToContent(blocks) : content} />
              </div>
            </div>

          </div>
        )}

        {/* Right Sidebar: Document, Block & SEO Settings */}
        <div className="w-72 lg:w-80 bg-[#161824] border-l border-[#242738] flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#242738] text-xs font-semibold">
            <button
              onClick={() => setSidebarTab('document')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'document' ? 'border-violet-500 text-white font-bold bg-[#1b1e2e]' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Post Details
            </button>
            <button
              onClick={() => setSidebarTab('seo')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'seo' ? 'border-violet-500 text-white font-bold bg-[#1b1e2e]' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Yoast SEO
            </button>
          </div>

          <div className="p-4 space-y-5 text-xs">
            {sidebarTab === 'document' ? (
              <>
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* AI Model (If prompt) */}
                {type === 'prompt' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block font-medium text-slate-300">Target AI Engine</label>
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value as AIModel)}
                        className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        {MODELS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-medium text-slate-300">Aspect Ratio</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                      >
                        {RATIOS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Featured Image */}
                <div className="space-y-2 bg-[#10121b] p-3.5 rounded-xl border border-[#272b3e]">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                      <span>Featured Image</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WebP</span>
                  </div>

                  {/* Upload Actions Toolbar */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="file"
                      ref={featuredFileInputRef}
                      accept="image/*"
                      onChange={handleFeaturedFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => featuredFileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTargetBlockIdx(null); setShowMediaPicker(true); }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1c1f2e] hover:bg-[#282c42] text-slate-200 hover:text-white border border-[#2e334d] font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Media Library</span>
                    </button>
                  </div>

                  {/* Quick Sample Presets */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Or pick AI preset:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_PRESET_IMAGES.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`aspect-square rounded-lg overflow-hidden border ${image === preset.url ? 'border-violet-500 ring-2 ring-violet-500/40' : 'border-[#2e334d] hover:border-violet-400'} relative group cursor-pointer transition-all`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct URL Input */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Or paste external image URL..."
                      className="w-full bg-[#08090f] border border-[#24283b] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>

                  {/* Preview Card */}
                  {image && (
                    <div className="relative rounded-lg overflow-hidden border border-[#272b3e] mt-2 aspect-video bg-black group shadow-md">
                      <img src={image} alt="Featured Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => featuredFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Excerpt */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Summary / Excerpt</label>
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence overview for cards and search results..."
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    placeholder="85mm, Portrait, Golden Hour"
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </>
            ) : (
              /* SEO RankMath / Yoast Tab */
              <div className="space-y-4">
                <div className="p-3 bg-[#11131c] rounded-lg border border-[#272b3e] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Google SERP Preview</span>
                  <p className="text-violet-400 font-semibold text-xs truncate">{metaTitle || title || 'Post Title'}</p>
                  <p className="text-emerald-400 font-mono text-[10px] truncate">https://your-domain.com/posts/{slug}</p>
                  <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{metaDescription || excerpt || 'Post description for search engines...'}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Focus Keyword</label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. 85mm portrait prompt"
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title}
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Meta Description</label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt}
                    className="w-full bg-[#10121b] border border-[#272b3e] rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Gutenberg Block Inserter Modal */}
      {showBlockPicker && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161824] border border-[#2b2f44] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#242738]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-violet-400" />
                  <span>Choose Gutenberg Block</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a block to insert into your article
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockPicker(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222538] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'paragraph', label: 'Paragraph', desc: 'Standard text & markdown', icon: FileText, color: 'text-blue-400' },
                { type: 'heading', label: 'Heading (H1-H6)', desc: 'Section titles & subheadings', icon: Heading2, color: 'text-violet-400' },
                { type: 'callout', label: 'Callout Boxes', desc: 'Info, Warning, Tip, Danger', icon: Sparkles, color: 'text-amber-400' },
                { type: 'faq', label: 'FAQ Accordion', desc: 'Collapsible Q&A items', icon: HelpCircle, color: 'text-emerald-400' },
                { type: 'video', label: 'YouTube Video', desc: 'Embedded responsive video', icon: Youtube, color: 'text-rose-400' },
                { type: 'gallery', label: 'Image Gallery', desc: 'Grid of 2-4 images', icon: ImageIcon, color: 'text-cyan-400' },
                { type: 'quote', label: 'Quote', desc: 'Blockquote with author citation', icon: Quote, color: 'text-pink-400' },
                { type: 'buttons', label: 'CTA Button', desc: 'Link with styled button', icon: ArrowRight, color: 'text-indigo-400' },
                { type: 'code', label: 'Code Block', desc: 'Syntax highlighted code', icon: Code, color: 'text-slate-300' },
                { type: 'divider', label: 'Divider (HR)', desc: 'Horizontal separation line', icon: Minus, color: 'text-slate-400' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      if (item.type === 'heading') addBlock({ id: `b-${Date.now()}`, type: 'heading', level: 2, content: 'New Section' });
                      else if (item.type === 'paragraph') addBlock({ id: `b-${Date.now()}`, type: 'paragraph', content: 'New paragraph content...' });
                      else if (item.type === 'callout') addBlock({ id: `b-${Date.now()}`, type: 'callout', calloutType: 'tip', calloutTitle: 'Pro Tip', content: 'Add your tip details here...' });
                      else if (item.type === 'faq') addBlock({ id: `b-${Date.now()}`, type: 'faq', faqItems: [{ question: 'How do I use this prompt?', answer: 'Follow the guidelines provided above.' }] });
                      else if (item.type === 'video') addBlock({ id: `b-${Date.now()}`, type: 'video', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' });
                      else if (item.type === 'gallery') addBlock({ id: `b-${Date.now()}`, type: 'gallery', images: [{ url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' }] });
                      else if (item.type === 'quote') addBlock({ id: `b-${Date.now()}`, type: 'quote', content: 'Design is not just what it looks like and feels like. Design is how it works.', quoteAuthor: 'Steve Jobs' });
                      else if (item.type === 'buttons') addBlock({ id: `b-${Date.now()}`, type: 'buttons', buttons: [{ text: 'Explore Prompts', url: '#explore', variant: 'primary' }] });
                      else if (item.type === 'code') addBlock({ id: `b-${Date.now()}`, type: 'code', codeLanguage: 'typescript', content: 'const prompt = "Cinematic 85mm Hasselblad";' });
                      else if (item.type === 'divider') addBlock({ id: `b-${Date.now()}`, type: 'divider' });
                    }}
                    className="p-3.5 rounded-xl bg-[#11131e] hover:bg-[#1f2235] border border-[#232738] hover:border-violet-500 text-left transition-all cursor-pointer flex flex-col gap-2 group"
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-violet-300">{item.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151724] border border-[#2b2f44] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#242738]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Select from Media Library</h3>
                  <p className="text-xs text-slate-400">Choose an image for your post or upload a new one</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222538] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload New in Modal */}
            <div className="flex items-center justify-between bg-[#0e1018] p-3 rounded-xl border border-[#24283b]">
              <span className="text-xs text-slate-300">Upload a new photo from your device:</span>
              <button
                type="button"
                onClick={() => featuredFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browse Files</span>
              </button>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {mediaList.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => {
                      if (targetBlockIdx !== null) {
                        const targetBlock = blocks[targetBlockIdx];
                        if (targetBlock.type === 'gallery') {
                          const newImages = [...(targetBlock.images || []), { url: med.url, caption: med.name }];
                          updateBlockData(targetBlockIdx, { images: newImages });
                        } else {
                          updateBlockData(targetBlockIdx, { url: med.url, caption: med.name });
                        }
                      } else {
                        setImage(med.url);
                      }
                      setShowMediaPicker(false);
                      showToast(`Selected "${med.name}"`);
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-[#272b3e] hover:border-violet-500 bg-[#0d0e17] transition-all cursor-pointer text-left"
                  >
                    <img src={med.url} alt={med.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <span className="text-[10px] font-semibold text-white truncate">{med.name}</span>
                      <span className="text-[9px] text-violet-300 font-mono">{med.dimensions}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#242738] flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-4 py-2 rounded-xl bg-[#202334] hover:bg-[#2c3048] text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
