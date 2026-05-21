/**
 * SmartClip AI - Type Definitions
 */

export interface ClipboardItem {
  id: string;
  content: string;
  type: ContentType;
  category: ContentCategory;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  lastAccessedAt: number | null;
  source: string | null;
  hash: string;
}

export type ContentType = 'text' | 'url' | 'code' | 'email' | 'image' | 'json' | 'other';

export type ContentCategory = 
  | 'code_snippet'
  | 'url_link'
  | 'email_address'
  | 'command'
  | 'note'
  | 'json_data'
  | 'image_path'
  | 'plain_text'
  | 'password'
  | 'api_key';

export interface SearchOptions {
  query: string;
  type?: ContentType;
  category?: ContentCategory;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
  limit?: number;
  fuzzy?: boolean;
}

export interface SearchResult {
  items: ClipboardItem[];
  total: number;
  query: string;
}

export interface ClipStats {
  totalItems: number;
  typeDistribution: Record<ContentType, number>;
  categoryDistribution: Record<ContentCategory, number>;
  topTags: { tag: string; count: number }[];
  dailyStats: { date: string; count: number }[];
}

export interface SmartClipConfig {
  maxHistorySize: number;
  autoCleanupDays: number;
  enableSemanticSearch: boolean;
  enableAutoTagging: boolean;
  ignoredPatterns: string[];
  databasePath: string;
}

export const DEFAULT_CONFIG: SmartClipConfig = {
  maxHistorySize: 1000,
  autoCleanupDays: 30,
  enableSemanticSearch: true,
  enableAutoTagging: true,
  ignoredPatterns: ['password', 'secret', 'token', 'key'],
  databasePath: '.data/smartclip.db',
};

export interface ContentAnalyzerResult {
  type: ContentType;
  category: ContentCategory;
  tags: string[];
  confidence: number;
}