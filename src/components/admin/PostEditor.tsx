import React, { useState, useEffect, useRef } from 'react';
import {
  Post,
  Category,
  Tag,
  User,
  MediaItem,
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
  PostRevision,
} from '../../types/cms';
import { LivePreviewModal } from './LivePreviewModal';
import { FeaturedImageUploader, FeaturedImageData } from './FeaturedImageUploader';
import { InlineImageEditor } from './InlineImageEditor';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Code2,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Table as TableIcon,
  HelpCircle,
  List,
  CheckSquare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Link,
  Plus,
  X,
  RotateCcw,
  Clock,
  Globe,
  Settings,
  History,
  Check,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  FileText,
  Smartphone,
  ExternalLink,
  BarChart2,
  Share2,
  Twitter,
  Facebook,
  Search,
  CheckCircle,
  XCircle,
  Pin,
  Flame,
  MessageSquare,
  BookOpen,
  Cloud,
  Github,
  Zap,
} from 'lucide-react';

interface PostEditorProps {
  post: Post | null;
  categories: Category[];
  tags: Tag[];
  currentUser: User;
  allUsers: User[];
  media?: MediaItem[];
  onAddMedia?: (item: MediaItem) => void;
  onSave: (postData: Partial<Post>, statusChange?: 'draft' | 'published' | 'scheduled' | 'trash') => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

// In-line Editor Content Items: either a text block (paragraph/heading/list) or a rich special block
export type EditorItem =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'block'; block: SpecialContentBlock };

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  categories,
  tags,
  currentUser,
  allUsers,
  media = [],
  onAddMedia,
  onSave,
  onCancel,
  onDelete,
}) => {
  // Post Meta Details
  const [title, setTitle] = useState(post?.title || '');
  const [subtitle, setSubtitle] = useState(post?.subtitle || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [editingSlug, setEditingSlug] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [authorId, setAuthorId] = useState(post?.authorId || currentUser.id);
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || []);
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || '');
  const [featuredImageCaption, setFeaturedImageCaption] = useState(post?.featuredImageCaption || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt || '');
  const [featuredImageCredit, setFeaturedImageCredit] = useState(post?.featuredImageCredit || '');
  const [showFeaturedImageInPost, setShowFeaturedImageInPost] = useState(post?.showFeaturedImageInPost !== false);
  const [status, setStatus] = useState(post?.status || 'draft');
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt || '');

  // Editorial & Engagement Toggles (Required for professional blogs)
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured || false);
  const [isTrending, setIsTrending] = useState(post?.isTrending || false);
  const [isSticky, setIsSticky] = useState(post?.isSticky || false);
  const [allowComments, setAllowComments] = useState(post?.allowComments !== false);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(post?.seo?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.seo?.metaDescription || '');
  const [focusKeyword, setFocusKeyword] = useState(post?.seo?.focusKeyword || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.seo?.canonicalUrl || '');
  const [robotsIndex, setRobotsIndex] = useState(post?.seo?.robotsIndex !== false);
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Editor Mode: 'visual' (WordPress / Blogger Block Editor) vs 'markdown' (Raw Code)
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual');

  // WordPress Inspector Tab on Right Sidebar: 'post' | 'seo' | 'stats' | 'revisions'
  const [inspectorTab, setInspectorTab] = useState<'post' | 'seo' | 'stats' | 'revisions'>('post');

  // Modals & UI States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved just now');
  const [tagInput, setTagInput] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Active insert popover index: which line or position to insert below (-1 = top)
  const [insertPopoverIndex, setInsertPopoverIndex] = useState<number | null>(null);

  // Parse initial content and blocks into ordered EditorItems
  const parseInitialItems = (): EditorItem[] => {
    const rawContent = post?.content || '';
    const rawBlocks = post?.blocks || [];

    // If content contains inline block comments: <!-- block:ID -->
    if (rawContent.includes('<!-- block:')) {
      const parts = rawContent.split(/(<!--\s*block:[a-zA-Z0-9_-]+\s*-->)/g);
      const items: EditorItem[] = [];
      const usedBlockIds = new Set<string>();

      parts.forEach((part, idx) => {
        const trimmed = part.trim();
        if (!trimmed) return;

        const match = trimmed.match(/<!--\s*block:([a-zA-Z0-9_-]+)\s*-->/);
        if (match) {
          const blkId = match[1];
          const found = rawBlocks.find((b) => b.id === blkId);
          if (found) {
            items.push({ id: `item-${blkId}`, type: 'block', block: found });
            usedBlockIds.add(blkId);
            return;
          }
        }

        // Otherwise it's text
        items.push({
          id: `item-txt-${idx}-${Date.now()}`,
          type: 'text',
          text: part,
        });
      });

      // Append any unplaced blocks
      rawBlocks.forEach((b) => {
        if (!usedBlockIds.has(b.id)) {
          items.push({ id: `item-${b.id}`, type: 'block', block: b });
        }
      });

      return items.length > 0 ? items : [{ id: 'init-txt-1', type: 'text', text: '' }];
    }

    // If content has NO tags but has text and blocks, split by paragraphs and weave blocks
    if (rawBlocks.length > 0) {
      const paragraphs = rawContent.split('\n\n').filter((p) => p.trim());
      const items: EditorItem[] = [];
      let blockIdx = 0;

      if (paragraphs.length === 0) {
        // Just the blocks
        rawBlocks.forEach((b) => items.push({ id: `item-${b.id}`, type: 'block', block: b }));
        items.push({ id: 'init-txt-end', type: 'text', text: '' });
        return items;
      }

      paragraphs.forEach((p, pIdx) => {
        items.push({ id: `p-${pIdx}`, type: 'text', text: p });
        // After every paragraph or two, weave in a block
        if (blockIdx < rawBlocks.length && (pIdx % 2 === 0 || pIdx === paragraphs.length - 1)) {
          items.push({
            id: `item-${rawBlocks[blockIdx].id}`,
            type: 'block',
            block: rawBlocks[blockIdx],
          });
          blockIdx++;
        }
      });

      // Any remaining blocks
      while (blockIdx < rawBlocks.length) {
        items.push({
          id: `item-${rawBlocks[blockIdx].id}`,
          type: 'block',
          block: rawBlocks[blockIdx],
        });
        blockIdx++;
      }

      return items;
    }

    // Default: simple single text block or split paragraphs
    if (rawContent.trim()) {
      return [{ id: 'txt-1', type: 'text', text: rawContent }];
    }

    return [{ id: 'txt-1', type: 'text', text: '' }];
  };

  const [items, setItems] = useState<EditorItem[]>(parseInitialItems);

  // Raw markdown content (kept in sync for Markdown mode)
  const compileToMarkdown = (currentItems: EditorItem[]): string => {
    return currentItems
      .map((item) => {
        if (item.type === 'text') return item.text.trim();
        return `<!-- block:${item.block.id} -->`;
      })
      .filter((s) => s.length > 0)
      .join('\n\n');
  };

  const [rawMarkdown, setRawMarkdown] = useState<string>(() => compileToMarkdown(items));

  // Sync when items change
  const updateItems = (newItems: EditorItem[]) => {
    setItems(newItems);
    setRawMarkdown(compileToMarkdown(newItems));
  };

  // Switch between Visual & Markdown modes
  const handleToggleMode = (newMode: 'visual' | 'markdown') => {
    if (newMode === 'markdown') {
      setRawMarkdown(compileToMarkdown(items));
    } else {
      // Re-parse markdown into items
      const parsed = parseMarkdownIntoItems(rawMarkdown, extractBlocks(items));
      setItems(parsed);
    }
    setEditorMode(newMode);
  };

  // Helper to extract all SpecialContentBlocks currently in state
  const extractBlocks = (itemList: EditorItem[]): SpecialContentBlock[] => {
    const list: SpecialContentBlock[] = [];
    itemList.forEach((it) => {
      if (it.type === 'block') list.push(it.block);
    });
    return list;
  };

  // Helper to parse markdown text back into EditorItems
  const parseMarkdownIntoItems = (
    md: string,
    existingBlocks: SpecialContentBlock[]
  ): EditorItem[] => {
    const parts = md.split(/(<!--\s*block:[a-zA-Z0-9_-]+\s*-->)/g);
    const newItems: EditorItem[] = [];

    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      const match = trimmed.match(/<!--\s*block:([a-zA-Z0-9_-]+)\s*-->/);
      if (match) {
        const blkId = match[1];
        const found = existingBlocks.find((b) => b.id === blkId);
        if (found) {
          newItems.push({ id: `item-${blkId}-${idx}`, type: 'block', block: found });
          return;
        }
      }

      newItems.push({
        id: `item-txt-${idx}-${Date.now()}`,
        type: 'text',
        text: part,
      });
    });

    return newItems.length > 0 ? newItems : [{ id: 'txt-empty', type: 'text', text: '' }];
  };

  // Auto-generate clean slug from title if not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post && !editingSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Word count & live blog metrics (Crucial for professional blogging)
  const fullText = items
    .map((it) => (it.type === 'text' ? it.text : ''))
    .join(' ');
  const words = fullText.trim() ? fullText.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = fullText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Sentence and readability analysis (Flesch-Kincaid scale)
  const sentenceCount = fullText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const avgWordsPerSentence = wordCount / sentenceCount;
  const readabilityGrade =
    avgWordsPerSentence < 12
      ? 'Easy to Read'
      : avgWordsPerSentence < 18
      ? 'Standard'
      : 'Advanced / Technical';

  // Count structure elements
  const imageBlocksCount =
    items.filter((it) => it.type === 'block' && it.block.type === 'image').length +
    (featuredImage ? 1 : 0);
  const headingsCount = items
    .filter((it) => it.type === 'text')
    .reduce((acc, it) => acc + (it.text.match(/^#{2,3}\s/gm)?.length || 0), 0);
  const customBlocksCount = items.filter((it) => it.type === 'block').length;

  // Live SEO Audit & Score
  const seoChecks = [
    {
      id: 'kw-set',
      label: 'Focus keyword specified',
      passed: !!focusKeyword.trim(),
    },
    {
      id: 'kw-title',
      label: 'Focus keyword appears in post title',
      passed:
        !!focusKeyword.trim() &&
        title.toLowerCase().includes(focusKeyword.toLowerCase().trim()),
    },
    {
      id: 'kw-slug',
      label: 'Focus keyword in URL slug',
      passed:
        !!focusKeyword.trim() &&
        slug
          .toLowerCase()
          .includes(focusKeyword.toLowerCase().trim().replace(/\s+/g, '-')),
    },
    {
      id: 'length',
      label: 'Article length (300+ words recommended)',
      passed: wordCount >= 300,
    },
    {
      id: 'feat-img',
      label: 'Featured image with descriptive Alt text',
      passed: !!featuredImage && !!featuredImageAlt,
    },
    {
      id: 'meta-desc',
      label: 'Meta description optimal length (80-160 chars)',
      passed: metaDescription.length >= 80 && metaDescription.length <= 165,
    },
  ];
  const passedSeoCount = seoChecks.filter((c) => c.passed).length;
  const seoScore = Math.round((passedSeoCount / seoChecks.length) * 100);

  // Auto-save feedback simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSavedTime(
        `Autosaved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    }, 40000);
    return () => clearInterval(timer);
  }, []);

  // INSERT BLOCK RIGHT BELOW A SPECIFIC LINE / ITEM
  const handleInsertBlockBelow = (targetIndex: number, newBlock: SpecialContentBlock) => {
    const newBlockItem: EditorItem = {
      id: `item-${newBlock.id}`,
      type: 'block',
      block: newBlock,
    };

    const newItems = [...items];
    const insertAt = targetIndex + 1; // Right below that line!
    newItems.splice(insertAt, 0, newBlockItem);

    // If the block is inserted at the end or before no text, ensure a clean text block follows
    if (insertAt === newItems.length - 1 || newItems[insertAt + 1]?.type !== 'text') {
      newItems.splice(insertAt + 1, 0, {
        id: `txt-${Date.now()}`,
        type: 'text',
        text: '',
      });
    }

    updateItems(newItems);
    setInsertPopoverIndex(null);
  };

  // INSERT TEXT PARAGRAPH RIGHT BELOW A SPECIFIC LINE
  const handleInsertTextBelow = (targetIndex: number) => {
    const newItems = [...items];
    newItems.splice(targetIndex + 1, 0, {
      id: `txt-${Date.now()}`,
      type: 'text',
      text: '',
    });
    updateItems(newItems);
    setInsertPopoverIndex(null);
  };

  // Move item Up or Down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    updateItems(newItems);
  };

  // Remove Item
  const removeItem = (index: number) => {
    if (items.length <= 1) {
      updateItems([{ id: 'txt-blank', type: 'text', text: '' }]);
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    updateItems(newItems);
  };

  // Update Text Item Content
  const updateTextItem = (index: number, newText: string) => {
    const newItems = [...items];
    if (newItems[index]?.type === 'text') {
      newItems[index] = { ...newItems[index], text: newText };
      updateItems(newItems);
    }
  };

  // Update Special Block Content
  const updateBlockItem = (index: number, updatedBlock: SpecialContentBlock) => {
    const newItems = [...items];
    if (newItems[index]?.type === 'block') {
      newItems[index] = { ...newItems[index], block: updatedBlock };
      updateItems(newItems);
    }
  };

  // Text formatting insertion helper for active text areas
  const applyTextFormat = (itemIndex: number, prefix: string, suffix: string = '') => {
    const item = items[itemIndex];
    if (item.type !== 'text') return;
    const updated = `${item.text}\n${prefix}Heading / Note${suffix}`;
    updateTextItem(itemIndex, updated);
  };

  // Add Tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().toLowerCase().replace(/[^\w-]/g, '-');
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  // Save compilation
  const buildPostData = (
    targetStatus?: 'draft' | 'published' | 'scheduled' | 'trash'
  ): Partial<Post> => {
    const finalStatus = targetStatus || status;
    const finalContent = editorMode === 'markdown' ? rawMarkdown : compileToMarkdown(items);
    const finalBlocks = extractBlocks(items);

    return {
      title: title || 'Untitled Article',
      subtitle: subtitle || undefined,
      slug: slug || 'untitled-article',
      excerpt: excerpt || '',
      content: finalContent,
      blocks: finalBlocks,
      featuredImage:
        featuredImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
      featuredImageCaption,
      featuredImageAlt,
      featuredImageCredit,
      showFeaturedImageInPost,
      status: finalStatus,
      authorId,
      categoryId,
      tags: selectedTags,
      isFeatured,
      isTrending,
      isSticky,
      allowComments,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
      publishedAt:
        finalStatus === 'published'
          ? post?.publishedAt || new Date().toISOString()
          : undefined,
      readingTimeMinutes,
      seo: {
        seoTitle: seoTitle || title,
        metaDescription: metaDescription || excerpt,
        focusKeyword,
        canonicalUrl,
        robotsIndex,
        robotsFollow: true,
      },
    };
  };

  const handleSaveDraft = () => {
    onSave(buildPostData('draft'), 'draft');
  };

  const handlePublish = () => {
    onSave(buildPostData('published'), 'published');
  };

  const currentPreviewPost: Post = {
    id: post?.id || 'preview-temp',
    title: title || 'Untitled Article',
    subtitle,
    slug: slug || 'article-preview',
    excerpt,
    content: editorMode === 'markdown' ? rawMarkdown : compileToMarkdown(items),
    blocks: extractBlocks(items),
    featuredImage:
      featuredImage ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption,
    featuredImageAlt,
    featuredImageCredit,
    showFeaturedImageInPost,
    status: 'published',
    authorId,
    categoryId,
    tags: selectedTags,
    views: post?.views || 1,
    readingTimeMinutes,
    seo: {
      seoTitle,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      robotsIndex,
      robotsFollow: true,
    },
    createdAt: post?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const activeCategory = categories.find((c) => c.id === categoryId);

  // Test copy prompt feedback
  const handleTestCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100">
      {/* 1. WordPress / Blogger Style Top Action Bar */}
      <div className="sticky top-0 z-30 h-14 bg-[#0d131f] border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">All Posts</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Mode Switch: Visual Blocks vs Raw Markdown */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                editorMode === 'visual'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Visual Blocks</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                editorMode === 'markdown'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Markdown</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden md:inline ml-1">
            {lastSavedTime}
          </span>
        </div>

        {/* Action Buttons: Save Draft | Preview | Publish */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            title="Saves and automatically pushes to GitHub to trigger Cloudflare edge deployment"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{status === 'published' ? 'Update & Deploy' : 'Publish & Deploy'}</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-mono text-amber-200">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              <span>Auto</span>
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Writing Canvas + Right Inspector Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Writing Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 lg:p-10 space-y-6">
          {/* Article Title Input (Blogger / WordPress standard "Add title") */}
          <div className="space-y-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Add post title..."
              className="w-full bg-transparent text-2xl sm:text-4xl font-display font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight leading-tight"
            />

            {/* Subtitle / Deck (Standard in Medium/Substack/WP) */}
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Add a compelling subtitle or deck (optional)..."
              className="w-full bg-transparent text-base sm:text-lg text-slate-300 placeholder-slate-600 focus:outline-none leading-relaxed"
            />

            {/* Permalink Preview with Edit & Regenerate buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono pt-1">
              <span className="text-slate-500">Permalink:</span>
              <span className="text-slate-400">https://astroblog.dev/</span>
              {editingSlug ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => setEditingSlug(false)}
                    className="px-2 py-0.5 rounded bg-orange-600 text-white text-[11px] font-semibold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-semibold">{slug || 'untitled-post'}</span>
                  <button
                    onClick={() => setEditingSlug(true)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = (title || 'article')
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setSlug(gen);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px]"
                    title="Regenerate slug from title"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* Live Blog Post Metrics Ribbon (Essential for Authors & Bloggers) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{readingTimeMinutes} min read</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Readability: {readabilityGrade}</span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium ${
                  seoScore >= 80
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : seoScore >= 50
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SEO Score: {seoScore}%</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner Explaining In-Place Element Flow */}
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200/90 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-orange-300">
                In-Line Element Insertion (WordPress & Blogger Style):
              </span>{' '}
              Click any{' '}
              <strong className="text-white">+ Add Element Below This Line</strong> button to
              insert an AI Prompt Box, Code Snippet, Notice, Table, or FAQ{' '}
              <em>right below that exact line</em>. You can move items Up or Down at any time.
            </div>
          </div>

          {/* ============================================================== */}
          {/* MODE A: VISUAL IN-LINE BLOCK EDITOR (WORDPRESS / BLOGGER STYLE) */}
          {/* ============================================================== */}
          {editorMode === 'visual' && (
            <div className="space-y-4">
              {/* Insert at Top of Article */}
              <div className="relative flex justify-center py-1">
                <button
                  type="button"
                  onClick={() =>
                    setInsertPopoverIndex(insertPopoverIndex === -1 ? null : -1)
                  }
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-dashed border-slate-700 hover:border-orange-500 text-slate-400 hover:text-orange-400 text-xs font-semibold bg-[#0d131f] transition-all hover:scale-105 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Element at Top of Article</span>
                </button>

                {insertPopoverIndex === -1 && (
                  <div className="absolute top-9 z-40">
                    <BlockPickerMenu
                      onSelect={(block) => handleInsertBlockBelow(-1, block)}
                      onAddText={() => handleInsertTextBelow(-1)}
                      onClose={() => setInsertPopoverIndex(null)}
                    />
                  </div>
                )}
              </div>

              {/* Sequential Ordered Items Stream */}
              {items.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {/* --- ITEM TYPE 1: TEXT PARAGRAPH / MARKDOWN --- */}
                  {item.type === 'text' && (
                    <div className="group relative rounded-xl border border-transparent hover:border-slate-800 p-2 sm:p-3 transition-colors bg-slate-900/20">
                      {/* Floating mini formatting bar on hover */}
                      <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '**', '**')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-300"
                            title="Bold"
                          >
                            <Bold className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '*', '*')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-300"
                            title="Italic"
                          >
                            <Italic className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '## ')}
                            className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 text-[11px] font-bold"
                            title="Heading 2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '### ')}
                            className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 text-[11px] font-bold"
                            title="Heading 3"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '- ')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-300"
                            title="Bullet List"
                          >
                            <List className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormat(idx, '> ')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-300"
                            title="Quote"
                          >
                            <Quote className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'up')}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < items.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'down')}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="p-1 rounded hover:bg-slate-800 text-rose-400"
                              title="Delete Text Block"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <textarea
                        rows={Math.max(2, item.text.split('\n').length)}
                        value={item.text}
                        onChange={(e) => updateTextItem(idx, e.target.value)}
                        placeholder="Write paragraph or heading here (type ## for H2, - for bullet list)..."
                        className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-base sm:text-lg leading-relaxed font-sans resize-none"
                      />
                    </div>
                  )}

                  {/* --- ITEM TYPE 2: SPECIAL CONTENT BLOCK (IN-LINE VISUAL CARD) --- */}
                  {item.type === 'block' && (
                    <div className="relative rounded-2xl border-2 border-orange-500/40 bg-[#0d1424] p-4 sm:p-5 shadow-xl space-y-3 transition-all hover:border-orange-500">
                      {/* Block Header with In-Place Location Badge and Move Controls */}
                      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                        <div className="flex items-center gap-2">
                          <BlockIcon type={item.block.type} />
                          <span className="font-bold text-xs uppercase tracking-wider text-white">
                            {formatBlockLabel(item.block.type)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Placed right below line {idx}
                          </span>
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                            title="Move above previous line"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 'down')}
                            disabled={idx === items.length - 1}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                            title="Move below next line"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/60 transition-colors"
                            title="Delete this block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* --- IN-PLACE EDITOR PER BLOCK TYPE --- */}
                      {/* 1. Prompt Block */}
                      {item.block.type === 'prompt' && (
                        <div className="space-y-3 pt-1">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Target AI Model / Tool
                              </label>
                              <input
                                type="text"
                                value={item.block.modelTarget || ''}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    modelTarget: e.target.value,
                                  } as PromptBlock)
                                }
                                placeholder="e.g. Claude 3.7 / Gemini 2.5 / DeepSeek V3"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                User Notes / Usage Tip
                              </label>
                              <input
                                type="text"
                                value={item.block.notes || ''}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    notes: e.target.value,
                                  } as PromptBlock)
                                }
                                placeholder="e.g. Paste directly into your prompt orchestrator"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Prompt Text (What readers will copy)
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTestCopyPrompt(
                                    item.block.id,
                                    (item.block as PromptBlock).promptText
                                  )
                                }
                                className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300"
                              >
                                {copiedPromptId === item.block.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Test Copy Button</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <textarea
                              rows={4}
                              value={item.block.promptText}
                              onChange={(e) =>
                                updateBlockItem(idx, {
                                  ...item.block,
                                  promptText: e.target.value,
                                } as PromptBlock)
                              }
                              placeholder="Act as an expert... Write your detailed prompt instructions here..."
                              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-100 focus:outline-none focus:border-orange-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. Code Block */}
                      {item.block.type === 'code' && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Language
                              </label>
                              <select
                                value={item.block.language || 'typescript'}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    language: e.target.value,
                                  } as CodeBlock)
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              >
                                <option value="typescript">TypeScript</option>
                                <option value="javascript">JavaScript</option>
                                <option value="bash">Bash / Shell</option>
                                <option value="python">Python</option>
                                <option value="sql">SQL</option>
                                <option value="json">JSON</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Filename (Optional)
                              </label>
                              <input
                                type="text"
                                value={item.block.filename || ''}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    filename: e.target.value,
                                  } as CodeBlock)
                                }
                                placeholder="e.g. index.ts or wrangler.toml"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Code Content
                            </label>
                            <textarea
                              rows={5}
                              value={item.block.code}
                              onChange={(e) =>
                                updateBlockItem(idx, {
                                  ...item.block,
                                  code: e.target.value,
                                } as CodeBlock)
                              }
                              placeholder="// Paste or write code snippet here..."
                              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 focus:outline-none focus:border-orange-500 leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. Callout / Notice */}
                      {(item.block.type === 'info' ||
                        item.block.type === 'warning' ||
                        item.block.type === 'important' ||
                        item.block.type === 'tip') && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Callout Style
                              </label>
                              <select
                                value={item.block.type}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    type: e.target.value as any,
                                  } as CalloutBlock)
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              >
                                <option value="info">Info (Blue)</option>
                                <option value="tip">Pro Tip (Green)</option>
                                <option value="warning">Warning (Amber)</option>
                                <option value="important">Important (Rose)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Title / Headline
                              </label>
                              <input
                                type="text"
                                value={item.block.title || ''}
                                onChange={(e) =>
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    title: e.target.value,
                                  } as CalloutBlock)
                                }
                                placeholder="e.g. Algorithmic Retention Tip"
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Message Content
                            </label>
                            <textarea
                              rows={3}
                              value={item.block.content}
                              onChange={(e) =>
                                updateBlockItem(idx, {
                                  ...item.block,
                                  content: e.target.value,
                                } as CalloutBlock)
                              }
                              placeholder="Type your callout message or tip here..."
                              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. Pros & Cons */}
                      {item.block.type === 'pros_cons' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          {/* Pros */}
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              <span>Pros (Advantages)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = {
                                    ...item.block,
                                    pros: [...(item.block as ProsConsBlock).pros, 'New advantage'],
                                  };
                                  updateBlockItem(idx, updated as ProsConsBlock);
                                }}
                                className="text-[11px] hover:underline"
                              >
                                + Add Pro
                              </button>
                            </div>
                            {(item.block as ProsConsBlock).pros.map((pro, pI) => (
                              <div key={pI} className="flex items-center gap-1.5">
                                <span className="text-emerald-400 text-xs font-bold">✓</span>
                                <input
                                  type="text"
                                  value={pro}
                                  onChange={(e) => {
                                    const nextPros = [...(item.block as ProsConsBlock).pros];
                                    nextPros[pI] = e.target.value;
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      pros: nextPros,
                                    } as ProsConsBlock);
                                  }}
                                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextPros = [...(item.block as ProsConsBlock).pros];
                                    nextPros.splice(pI, 1);
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      pros: nextPros,
                                    } as ProsConsBlock);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Cons */}
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider">
                              <span>Cons (Disadvantages)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = {
                                    ...item.block,
                                    cons: [...(item.block as ProsConsBlock).cons, 'New trade-off'],
                                  };
                                  updateBlockItem(idx, updated as ProsConsBlock);
                                }}
                                className="text-[11px] hover:underline"
                              >
                                + Add Con
                              </button>
                            </div>
                            {(item.block as ProsConsBlock).cons.map((con, cI) => (
                              <div key={cI} className="flex items-center gap-1.5">
                                <span className="text-rose-400 text-xs font-bold">✗</span>
                                <input
                                  type="text"
                                  value={con}
                                  onChange={(e) => {
                                    const nextCons = [...(item.block as ProsConsBlock).cons];
                                    nextCons[cI] = e.target.value;
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      cons: nextCons,
                                    } as ProsConsBlock);
                                  }}
                                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextCons = [...(item.block as ProsConsBlock).cons];
                                    nextCons.splice(cI, 1);
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      cons: nextCons,
                                    } as ProsConsBlock);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 p-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Table Block */}
                      {item.block.type === 'table' && (
                        <div className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={item.block.caption || ''}
                            onChange={(e) =>
                              updateBlockItem(idx, {
                                ...item.block,
                                caption: e.target.value,
                              } as TableBlock)
                            }
                            placeholder="Table Caption / Title"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-semibold"
                          />
                          <div className="overflow-x-auto text-xs">
                            <table className="w-full text-left border-collapse border border-slate-800">
                              <thead>
                                <tr className="bg-slate-900">
                                  {item.block.headers.map((h, hI) => (
                                    <th key={hI} className="p-2 border border-slate-800">
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const nextHeaders = [...(item.block as TableBlock).headers];
                                          nextHeaders[hI] = e.target.value;
                                          updateBlockItem(idx, {
                                            ...item.block,
                                            headers: nextHeaders,
                                          } as TableBlock);
                                        }}
                                        className="w-full bg-transparent font-bold text-orange-400 focus:outline-none"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.block.rows.map((row, rI) => (
                                  <tr key={rI} className="hover:bg-slate-900/40">
                                    {row.map((cell, cI) => (
                                      <td key={cI} className="p-2 border border-slate-800">
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const nextRows = [...(item.block as TableBlock).rows];
                                            nextRows[rI] = [...nextRows[rI]];
                                            nextRows[rI][cI] = e.target.value;
                                            updateBlockItem(idx, {
                                              ...item.block,
                                              rows: nextRows,
                                            } as TableBlock);
                                          }}
                                          className="w-full bg-transparent text-slate-300 focus:outline-none"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 6. FAQ Block */}
                      {item.block.type === 'faq' && (
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              FAQ Questions & Answers
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextItems = [
                                  ...(item.block as FaqBlock).items,
                                  {
                                    id: `faq-${Date.now()}`,
                                    question: 'New Question?',
                                    answer: 'Detailed answer goes here.',
                                  },
                                ];
                                updateBlockItem(idx, {
                                  ...item.block,
                                  items: nextItems,
                                } as FaqBlock);
                              }}
                              className="text-xs text-orange-400 hover:underline"
                            >
                              + Add Q&A
                            </button>
                          </div>
                          {(item.block as FaqBlock).items.map((faq, fI) => (
                            <div
                              key={faq.id}
                              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const next = [...(item.block as FaqBlock).items];
                                    next[fI] = { ...next[fI], question: e.target.value };
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      items: next,
                                    } as FaqBlock);
                                  }}
                                  placeholder="Question?"
                                  className="w-full bg-transparent font-semibold text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...(item.block as FaqBlock).items];
                                    next.splice(fI, 1);
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      items: next,
                                    } as FaqBlock);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 text-xs ml-2"
                                >
                                  ×
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                value={faq.answer}
                                onChange={(e) => {
                                  const next = [...(item.block as FaqBlock).items];
                                  next[fI] = { ...next[fI], answer: e.target.value };
                                  updateBlockItem(idx, {
                                    ...item.block,
                                    items: next,
                                  } as FaqBlock);
                                }}
                                placeholder="Answer..."
                                className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 7. Key Takeaways */}
                      {item.block.type === 'takeaways' && (
                        <div className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={item.block.title}
                            onChange={(e) =>
                              updateBlockItem(idx, {
                                ...item.block,
                                title: e.target.value,
                              } as TakeawaysBlock)
                            }
                            placeholder="Executive Summary & Key Takeaways"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-bold"
                          />
                          <div className="space-y-1.5">
                            {item.block.items.map((takeaway, tI) => (
                              <div key={tI} className="flex items-center gap-2">
                                <span className="text-orange-400 font-bold">•</span>
                                <input
                                  type="text"
                                  value={takeaway}
                                  onChange={(e) => {
                                    const next = [...(item.block as TakeawaysBlock).items];
                                    next[tI] = e.target.value;
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      items: next,
                                    } as TakeawaysBlock);
                                  }}
                                  className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...(item.block as TakeawaysBlock).items];
                                    next.splice(tI, 1);
                                    updateBlockItem(idx, {
                                      ...item.block,
                                      items: next,
                                    } as TakeawaysBlock);
                                  }}
                                  className="text-slate-500 hover:text-rose-400 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const next = [
                                  ...(item.block as TakeawaysBlock).items,
                                  'New key takeaway bullet point',
                                ];
                                updateBlockItem(idx, {
                                  ...item.block,
                                  items: next,
                                } as TakeawaysBlock);
                              }}
                              className="text-xs text-orange-400 hover:underline pt-1 block"
                            >
                              + Add Bullet
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 8. Call to Action (CTA) */}
                      {item.block.type === 'cta' && (
                        <div className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={item.block.title}
                            onChange={(e) =>
                              updateBlockItem(idx, {
                                ...item.block,
                                title: e.target.value,
                              } as CtaBlock)
                            }
                            placeholder="CTA Headline"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-bold"
                          />
                          <textarea
                            rows={2}
                            value={item.block.description}
                            onChange={(e) =>
                              updateBlockItem(idx, {
                                ...item.block,
                                description: e.target.value,
                              } as CtaBlock)
                            }
                            placeholder="CTA Description..."
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={item.block.buttonText}
                              onChange={(e) =>
                                updateBlockItem(idx, {
                                  ...item.block,
                                  buttonText: e.target.value,
                                } as CtaBlock)
                              }
                              placeholder="Button Label (e.g. Download Free Pack)"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={item.block.buttonUrl}
                              onChange={(e) =>
                                updateBlockItem(idx, {
                                  ...item.block,
                                  buttonUrl: e.target.value,
                                } as CtaBlock)
                              }
                              placeholder="Button Link / URL"
                              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* 9. Image Block (With Computer Upload & Presets) */}
                      {item.block.type === 'image' && (
                        <div className="pt-1">
                          <InlineImageEditor
                            block={item.block}
                            onChange={(updated) => updateBlockItem(idx, updated)}
                            onRemove={() => removeItem(idx)}
                          />
                        </div>
                      )}

                      {/* 10. Section Divider Block */}
                      {item.block.type === 'divider' && (
                        <div className="py-2 text-center text-slate-500 font-mono text-xs">
                          <div className="border-t border-slate-800 my-2 relative">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#0d1424] px-3 text-slate-500 text-[11px] tracking-widest font-mono">
                              ✦ Section Divider Line ✦
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- IN-LINE INSERTION STRIP BELOW THIS LINE --- */}
                  <div className="relative flex justify-center py-2 group/insert">
                    <button
                      type="button"
                      onClick={() =>
                        setInsertPopoverIndex(insertPopoverIndex === idx ? null : idx)
                      }
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 hover:border-orange-500 bg-[#0d131f] text-slate-400 hover:text-orange-400 text-xs font-semibold transition-all hover:scale-105 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      <span>+ Add Element Below This Line</span>
                    </button>

                    {/* In-Place Block Picker Popover */}
                    {insertPopoverIndex === idx && (
                      <div className="absolute top-10 z-40">
                        <BlockPickerMenu
                          onSelect={(block) => handleInsertBlockBelow(idx, block)}
                          onAddText={() => handleInsertTextBelow(idx)}
                          onClose={() => setInsertPopoverIndex(null)}
                        />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE B: RAW MARKDOWN EDITOR (POWER USER) */}
          {/* ============================================================== */}
          {editorMode === 'markdown' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Raw Markdown mode with embedded{' '}
                  <code className="text-orange-400 font-mono">&lt;!-- block:ID --&gt;</code>{' '}
                  markers.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRawMarkdown(
                      rawMarkdown +
                        `\n\n<!-- block:blk-${Date.now()} -->\n\n`
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
                >
                  + Add Block Marker
                </button>
              </div>

              <textarea
                rows={22}
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#080c14] border border-slate-800 font-mono text-sm text-slate-200 focus:outline-none focus:border-orange-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {/* Article Footer Stats */}
          <div className="text-xs text-slate-500 pt-6 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>
              {wordCount} words · ~{readingTimeMinutes} min read
            </span>
            <span>Astro 5 Islands Baseline</span>
          </div>
        </div>

        {/* Right Column: WordPress "Inspector" Settings Panel */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0b101c] shrink-0 p-5 space-y-5">
          {/* Inspector Tabs: Article | SEO & Social | Stats | Revisions */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setInspectorTab('post')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                inspectorTab === 'post'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Article
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('seo')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                inspectorTab === 'seo'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SEO & Social
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('stats')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                inspectorTab === 'stats'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stats
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('revisions')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                inspectorTab === 'revisions'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revisions
            </button>
          </div>

          {/* TAB 1: ARTICLE SETTINGS */}
          {inspectorTab === 'post' && (
            <div className="space-y-5 text-xs">
              {/* Status & Visibility */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Status & Visibility</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Post Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="draft">Draft (Private to Authors)</option>
                    <option value="published">Published (Live on Edge)</option>
                    <option value="scheduled">Scheduled for Release</option>
                  </select>
                </div>

                {status === 'scheduled' && (
                  <div className="space-y-1">
                    <label className="text-slate-400">Publish Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Cloudflare Auto-Deploy Status Banner */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Auto-Deploy: Enabled</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    Clicking <strong>Publish & Deploy</strong> automatically pushes your article to GitHub and deploys to Cloudflare Pages edge.
                  </p>
                </div>
              </div>

              {/* Author Assignment */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <label className="font-semibold text-white block">Author</label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <label className="font-semibold text-white block">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {activeCategory && (
                  <div
                    className="text-[11px] flex items-center gap-1.5"
                    style={{ color: activeCategory.color }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeCategory.color }}
                    />
                    <span>{activeCategory.description}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <label className="font-semibold text-white block">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px]"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Image (With Device File Upload, Stock Presets, Alt Text & Caption) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Featured Image</span>
                  <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-medium">
                    Hero Banner
                  </span>
                </div>
                <FeaturedImageUploader
                  imageData={{
                    url: featuredImage,
                    alt: featuredImageAlt,
                    caption: featuredImageCaption,
                    credit: featuredImageCredit,
                    showInPost: showFeaturedImageInPost,
                  }}
                  onChange={(newData) => {
                    setFeaturedImage(newData.url);
                    setFeaturedImageAlt(newData.alt);
                    setFeaturedImageCaption(newData.caption);
                    setFeaturedImageCredit(newData.credit || '');
                    setShowFeaturedImageInPost(newData.showInPost !== false);
                  }}
                  postTitle={title}
                  mediaLibrary={media}
                  onUploadMedia={onAddMedia}
                />
              </div>

              {/* Excerpt */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-white block">Excerpt / Summary</label>
                  <span className="text-[10px] text-slate-500">{excerpt.length}/160 chars</span>
                </div>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short 1-2 sentence overview for cards and social previews..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Blog Options (Featured hero, trending ribbon, comments) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="font-semibold text-white">Blog Layout & Interaction</div>
                
                {/* Pin as Featured Hero */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200 group-hover:text-white flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Featured Hero Post</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Feature this in top hero banner on homepage</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                  />
                </label>

                {/* Trending Badge */}
                <label className="flex items-center justify-between cursor-pointer group pt-2 border-t border-slate-800/80">
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200 group-hover:text-white flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>Trending Badge</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Show in trending ticker on homepage</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                  />
                </label>

                {/* Allow Comments */}
                <label className="flex items-center justify-between cursor-pointer group pt-2 border-t border-slate-800/80">
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-200 group-hover:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Allow Reader Comments</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Enable reader comment form on this article</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                  />
                </label>
              </div>

              {/* Danger Zone: Delete */}
              {post && onDelete && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onDelete(post.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-950 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 font-medium text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move Article to Trash</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEO & SOCIAL STUDIO */}
          {inspectorTab === 'seo' && (
            <div className="space-y-4 text-xs">
              {/* Focus Keyword with live audit checklist */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-white">Focus Keyword</label>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      seoScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : seoScore >= 50
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    Score: {seoScore}%
                  </span>
                </div>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. artificial intelligence agent"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                />

                {/* Audit Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    SEO Health Checklist
                  </div>
                  {seoChecks.map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      {chk.passed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className={chk.passed ? 'text-slate-300' : 'text-slate-500'}>
                        {chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Google Search Preview (Desktop / Mobile Switcher) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>Google SERP Preview</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSerpPreviewMode('desktop')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        serpPreviewMode === 'desktop' ? 'bg-orange-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpPreviewMode('mobile')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        serpPreviewMode === 'mobile' ? 'bg-orange-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg bg-[#080d17] border border-slate-800 space-y-1 ${
                    serpPreviewMode === 'mobile' ? 'max-w-xs mx-auto border-dashed' : ''
                  }`}
                >
                  <div className="text-[11px] text-emerald-400 truncate font-mono">
                    https://astroblog.dev/{slug || 'post-slug'}
                  </div>
                  <div className="text-sm font-semibold text-blue-400 line-clamp-1 hover:underline cursor-pointer">
                    {seoTitle || title || 'Post Title - Astro Blog CMS'}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {metaDescription ||
                      excerpt ||
                      'Discover production insights, architecture best practices, and automated publishing workflows.'}
                  </div>
                </div>
              </div>

              {/* Social Share Card Preview (OpenGraph for Twitter / LinkedIn / WhatsApp) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Social Share Card (OpenGraph)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Twitter className="w-3 h-3" />
                    <Facebook className="w-3 h-3" />
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#080d17]">
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt="Social card banner"
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 bg-slate-950 flex items-center justify-center text-slate-600 text-[11px]">
                      No featured image uploaded
                    </div>
                  )}
                  <div className="p-2.5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                      astroblog.dev
                    </div>
                    <div className="font-bold text-slate-200 line-clamp-1 text-xs">
                      {seoTitle || title || 'Untitled Article'}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {metaDescription || excerpt || 'Click to read full article...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom SEO Fields */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400">SEO Custom Title</label>
                    <span className="text-[10px] text-slate-500">{(seoTitle || title).length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || 'Custom SEO Title...'}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400">Meta Description</label>
                    <span className="text-[10px] text-slate-500">{metaDescription.length}/160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="150-160 characters for search engines..."
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Canonical URL (Optional)</label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://original-domain.com/post"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">Index in Search Engines</div>
                    <div className="text-[10px] text-slate-500">Allow Google to index this post (robots: index)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={robotsIndex}
                    onChange={(e) => setRobotsIndex(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-600 focus:ring-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: READABILITY & STATS */}
          {inspectorTab === 'stats' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Article Composition</span>
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{wordCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Words</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-white">{charCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Characters</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-blue-400">~{readingTimeMinutes} min</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Reading Time</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-lg font-bold text-emerald-400">{readabilityGrade}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Readability</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Headings (H2 / H3):</span>
                    <span className="font-semibold text-white">{headingsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Images Included:</span>
                    <span className="font-semibold text-white">{imageBlocksCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Special Blocks:</span>
                    <span className="font-semibold text-white">{customBlocksCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Sentences:</span>
                    <span className="font-semibold text-white">{sentenceCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Avg Words/Sentence:</span>
                    <span className="font-semibold text-white">{avgWordsPerSentence.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="font-semibold text-white">Blogger Writing Tips</div>
                <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                  <li>Aim for 800-1,500 words for competitive SEO topics.</li>
                  <li>Break up text with H2 headings every 200-300 words.</li>
                  <li>Always configure an Alt tag for every image for Google Image discovery.</li>
                  <li>Include an AI Prompt or Callout block to make articles more interactive.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: REVISIONS */}
          {inspectorTab === 'revisions' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="font-semibold text-white block mb-1">Revision History</span>
                <p className="text-[11px] text-slate-400">
                  Every publish or draft save creates a point-in-time snapshot.
                </p>
              </div>

              {post?.revisions && post.revisions.length > 0 ? (
                post.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{rev.authorName}</span>
                      <span className="text-slate-500">
                        {new Date(rev.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate">{rev.note || rev.title}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle(rev.title);
                        const restored = parseMarkdownIntoItems(rev.content, rev.blocks || []);
                        updateItems(restored);
                      }}
                      className="text-orange-400 hover:underline text-[11px] font-semibold"
                    >
                      Restore this revision
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No previous revisions recorded yet.
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Responsive Device Live Preview Modal */}
      {showPreviewModal && (
        <LivePreviewModal
          isOpen={showPreviewModal}
          post={currentPreviewPost}
          author={currentUser}
          category={activeCategory}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

// ==============================================================
// SUB-COMPONENT: IN-LINE BLOCK PICKER POPOVER
// ==============================================================
interface BlockPickerMenuProps {
  onSelect: (block: SpecialContentBlock) => void;
  onAddText: () => void;
  onClose: () => void;
}

const BlockPickerMenu: React.FC<BlockPickerMenuProps> = ({ onSelect, onAddText, onClose }) => {
  return (
    <div className="w-80 rounded-2xl border border-slate-700 bg-[#0d1424] shadow-2xl p-2.5 space-y-1.5 z-50 text-xs">
      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
        <span>Insert Element Right Below</span>
        <button onClick={onClose} className="p-0.5 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 0. Image / Photo Element */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'image',
            id: `blk-${Date.now()}`,
            url: '',
            alt: 'Visual article illustration',
            caption: '',
            credit: '',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Image / Photo Element</div>
          <div className="text-[11px] text-slate-400">Upload file from computer or pick preset</div>
        </div>
      </button>

      {/* 1. Section Divider */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'divider',
            id: `blk-${Date.now()}`,
            style: 'dots',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-slate-700/40 text-slate-400 group-hover:scale-105 transition-transform">
          <Minus className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Section Divider Line</div>
          <div className="text-[11px] text-slate-400">Decorative break between paragraphs</div>
        </div>
      </button>

      {/* 2. AI Prompt Box */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'prompt',
            id: `blk-${Date.now()}`,
            promptText:
              'Act as a world-class strategist. Analyze the following and provide a 3-step action plan...',
            modelTarget: 'Claude 3.7 / Gemini 2.5',
            notes: 'Copy and paste directly into your LLM orchestrator.',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">AI Prompt Box</div>
          <div className="text-[11px] text-slate-400">Prompt with 1-click copy button</div>
        </div>
      </button>

      {/* 2. Code Block */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'code',
            id: `blk-${Date.now()}`,
            code: `// Sample implementation snippet\nconsole.log("Astro Blog CMS Edge Islands!");`,
            language: 'typescript',
            filename: 'index.ts',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
          <Code2 className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Code Block</div>
          <div className="text-[11px] text-slate-400">Syntax highlighted + filename</div>
        </div>
      </button>

      {/* 3. Callout / Notice */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'info',
            id: `blk-${Date.now()}`,
            title: 'Key Architectural Insight',
            content: 'Crucial advice or context for the reader placed right below this line.',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Notice / Callout Box</div>
          <div className="text-[11px] text-slate-400">Info, Tip, or Warning banner</div>
        </div>
      </button>

      {/* 4. Pros & Cons */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'pros_cons',
            id: `blk-${Date.now()}`,
            pros: ['Sub-10ms response times at edge', 'Zero server hosting costs'],
            cons: ['Requires pre-build step for static pages'],
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Pros & Cons Columns</div>
          <div className="text-[11px] text-slate-400">Comparison list with checks & crosses</div>
        </div>
      </button>

      {/* 5. Table Builder */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'table',
            id: `blk-${Date.now()}`,
            caption: 'Performance Comparison Table',
            headers: ['Feature', 'Astro 5', 'Standard SPA'],
            rows: [
              ['JS Bundle', '0 KB baseline', '320 KB'],
              ['Lighthouse Score', '100 / 100', '68 / 100'],
            ],
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
          <TableIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Table Builder</div>
          <div className="text-[11px] text-slate-400">Structured rows & columns</div>
        </div>
      </button>

      {/* 6. FAQ Accordion */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'faq',
            id: `blk-${Date.now()}`,
            items: [
              {
                id: `faq-${Date.now()}`,
                question: 'How does Cloudflare edge caching work?',
                answer: 'HTML is stored globally across 300+ city edge nodes for sub-10ms delivery.',
              },
            ],
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">FAQ Accordion</div>
          <div className="text-[11px] text-slate-400">Collapsible Q&A accordion</div>
        </div>
      </button>

      {/* 7. Key Takeaways */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'takeaways',
            id: `blk-${Date.now()}`,
            title: 'Key Takeaways',
            items: [
              'Zero-JavaScript baselines dramatically improve retention.',
              'Automated AI prompts save 80% of script composition time.',
            ],
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
          <List className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Key Takeaways Box</div>
          <div className="text-[11px] text-slate-400">Highlighted bullet summary list</div>
        </div>
      </button>

      {/* 8. Call To Action */}
      <button
        type="button"
        onClick={() =>
          onSelect({
            type: 'cta',
            id: `blk-${Date.now()}`,
            title: 'Ready to build with Astro & AI?',
            description: 'Download the free production starter kit and deploy in 5 minutes.',
            buttonText: 'Get Starter Kit',
            buttonUrl: '/contact',
          })
        }
        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
      >
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-white">Call to Action (CTA)</div>
          <div className="text-[11px] text-slate-400">Banner with title, copy & button</div>
        </div>
      </button>

      <div className="pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={onAddText}
          className="w-full text-left p-2 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 transition-colors group text-slate-300"
        >
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">New Text Paragraph</div>
            <div className="text-[11px] text-slate-400">Add an empty writing section</div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Helper: Block icon
const BlockIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    case 'divider':
      return <Minus className="w-4 h-4 text-slate-400" />;
    case 'prompt':
      return <Sparkles className="w-4 h-4 text-orange-400" />;
    case 'code':
      return <Code2 className="w-4 h-4 text-indigo-400" />;
    case 'info':
    case 'tip':
    case 'warning':
    case 'important':
      return <Info className="w-4 h-4 text-blue-400" />;
    case 'pros_cons':
      return <CheckSquare className="w-4 h-4 text-emerald-400" />;
    case 'table':
      return <TableIcon className="w-4 h-4 text-amber-400" />;
    case 'faq':
      return <HelpCircle className="w-4 h-4 text-purple-400" />;
    case 'takeaways':
      return <List className="w-4 h-4 text-cyan-400" />;
    case 'cta':
      return <Sparkles className="w-4 h-4 text-rose-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-orange-400" />;
  }
};

// Helper: Block label
const formatBlockLabel = (type: string) => {
  switch (type) {
    case 'image':
      return 'Image / Visual Element (In-Line)';
    case 'divider':
      return 'Section Divider Line';
    case 'prompt':
      return 'AI Prompt Box (With Copy Button)';
    case 'code':
      return 'Code Block';
    case 'info':
    case 'tip':
    case 'warning':
    case 'important':
      return 'Notice / Callout Box';
    case 'pros_cons':
      return 'Pros & Cons Box';
    case 'table':
      return 'Table Builder';
    case 'faq':
      return 'FAQ Accordion';
    case 'takeaways':
      return 'Key Takeaways Box';
    case 'cta':
      return 'Call To Action Banner';
    default:
      return type.replace('_', ' ');
  }
};
