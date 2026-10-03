export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'video'
  | 'audio'
  | 'quote'
  | 'list'
  | 'buttons'
  | 'columns'
  | 'table'
  | 'code'
  | 'html'
  | 'embed'
  | 'spacer'
  | 'divider'
  | 'callout'
  | 'faq'
  | 'prompt';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  textColor?: string;
  dropCap?: boolean;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  alt?: string;
  align?: 'left' | 'center' | 'right' | 'wide' | 'full';
  aspectRatio?: string;
  rounded?: boolean;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  images: { url: string; caption?: string; alt?: string }[];
  columns: 2 | 3 | 4;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string; // YouTube / Vimeo / MP4
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  url: string;
  title?: string;
  artist?: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  quote: string;
  citation?: string;
  style?: 'standard' | 'large' | 'pullquote';
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export interface ButtonsBlock extends BaseBlock {
  type: 'buttons';
  buttons: {
    id: string;
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
    target?: '_blank' | '_self';
  }[];
  align?: 'left' | 'center' | 'right';
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  columnsCount: 2 | 3 | 4;
  columnsContent: string[]; // text or markdown per column
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
  striped?: boolean;
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export interface HtmlBlock extends BaseBlock {
  type: 'html';
  rawHtml: string;
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  embedUrl: string;
  provider?: 'twitter' | 'codepen' | 'spotify' | 'generic';
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number; // in pixels
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style: 'solid' | 'dashed' | 'dots';
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  calloutType: 'info' | 'warning' | 'tip' | 'danger';
  title?: string;
  content: string;
}

export interface FaqBlock extends BaseBlock {
  type: 'faq';
  items: { question: string; answer: string }[];
}

export interface PromptBlock extends BaseBlock {
  type: 'prompt';
  promptFormula: string;
  model: string;
  aspectRatio: string;
  negativePrompt?: string;
  lighting?: string;
  lens?: string;
  variables?: { name: string; token: string; defaultValue: string; options?: string[] }[];
}

export type GutenbergBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | AudioBlock
  | QuoteBlock
  | ListBlock
  | ButtonsBlock
  | ColumnsBlock
  | TableBlock
  | CodeBlock
  | HtmlBlock
  | EmbedBlock
  | SpacerBlock
  | DividerBlock
  | CalloutBlock
  | FaqBlock
  | PromptBlock;
