/**
 * SmartClip AI - Main Manager
 * Orchestrates all components
 */

import { ClipDatabase } from './database';
import { ClipboardMonitor } from './clipboard';
import { ContentAnalyzer } from './analyzer';
import { SearchEngine } from './search';
import { ClipboardItem, SearchOptions, SearchResult, ClipStats, SmartClipConfig, DEFAULT_CONFIG } from './types';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export class SmartClipManager {
  public db: ClipDatabase;
  public monitor: ClipboardMonitor;
  public analyzer: ContentAnalyzer;
  public searchEngine: SearchEngine;
  public config: SmartClipConfig;

  private dataDir: string;
  private isInitialized = false;

  constructor(config: Partial<SmartClipConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Setup data directory
    this.dataDir = path.join(os.homedir(), '.smartclip');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    const dbPath = path.join(this.dataDir, 'smartclip.db');
    
    this.db = new ClipDatabase(dbPath);
    this.monitor = new ClipboardMonitor({
      interval: 500,
      skipDuplicates: true,
    });
    this.analyzer = new ContentAnalyzer();
    this.searchEngine = new SearchEngine();

    this.setupMonitorListeners();
  }

  private setupMonitorListeners(): void {
    this.monitor.on('change', async (item: ClipboardItem) => {
      try {
        await this.addItem(item);
        console.log(`📋 Captured: ${item.type} - ${item.category}`);
      } catch (error) {
        console.error('Error saving clipboard item:', error);
      }
    });

    this.monitor.on('error', (error) => {
      console.error('Clipboard monitor error:', error);
    });

    this.monitor.on('skipped', (content, reason) => {
      console.log(`⏭️ Skipped: ${reason}`);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.db.initialize();
    
    // Load existing items into search index
    const items = await this.db.getRecentItems(1000);
    this.searchEngine.updateIndex(items);

    this.isInitialized = true;
  }

  async addItem(item: ClipboardItem): Promise<boolean> {
    const added = await this.db.addItem(item);
    
    // Update search index
    const items = await this.db.getRecentItems(1000);
    this.searchEngine.updateIndex(items);

    // Cleanup old items if needed
    await this.cleanupOldItems();

    return added;
  }

  async addFromClipboard(): Promise<ClipboardItem | null> {
    const content = await this.monitor.read();
    
    if (!content || content.trim().length === 0) {
      return null;
    }

    const item = this.analyzer.createItem(content, 'manual');
    await this.addItem(item);
    
    return item;
  }

  async getRecent(limit: number = 20): Promise<ClipboardItem[]> {
    return this.db.getRecentItems(limit);
  }

  async search(options: SearchOptions): Promise<SearchResult> {
    return this.db.searchItems(options);
  }

  async fuzzySearch(query: string, limit: number = 20): Promise<SearchResult> {
    // Update search index first
    const items = await this.db.getRecentItems(1000);
    this.searchEngine.updateIndex(items);
    
    return this.searchEngine.search({ query, limit, fuzzy: true });
  }

  async getItem(id: string): Promise<ClipboardItem | null> {
    return this.db.getItemById(id);
  }

  async copyToClipboard(id: string): Promise<boolean> {
    const item = await this.db.getItemById(id);
    if (!item) return false;

    await this.monitor.write(item.content);
    
    // Update access count
    await this.db.addItem({
      ...item,
      accessCount: item.accessCount + 1,
      lastAccessedAt: Date.now(),
    });

    return true;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.db.deleteItem(id);
  }

  async getStats(): Promise<ClipStats> {
    return this.db.getStats();
  }

  async getByType(type: string, limit: number = 20): Promise<ClipboardItem[]> {
    return this.db.getItemsByType(type, limit);
  }

  async getByCategory(category: string, limit: number = 20): Promise<ClipboardItem[]> {
    return this.db.getItemsByCategory(category, limit);
  }

  async getByTag(tag: string, limit: number = 20): Promise<ClipboardItem[]> {
    return this.db.getItemsByTag(tag, limit);
  }

  async clearAll(): Promise<void> {
    await this.db.clearAll();
    this.searchEngine.clear();
  }

  async cleanupOldItems(): Promise<number> {
    const stats = await this.db.getStats();
    
    if (stats.totalItems > this.config.maxHistorySize) {
      const toDelete = stats.totalItems - this.config.maxHistorySize;
      const items = await this.db.getRecentItems(stats.totalItems);
      const oldItems = items.slice(-toDelete);
      
      for (const item of oldItems) {
        await this.db.deleteItem(item.id);
      }
      
      return toDelete;
    }

    // Also delete items older than autoCleanupDays
    const deleted = await this.db.deleteOldItems(this.config.autoCleanupDays);
    return deleted;
  }

  startMonitoring(): void {
    this.monitor.start();
  }

  stopMonitoring(): void {
    this.monitor.stop();
  }

  async exportData(): Promise<string> {
    const items = await this.db.getRecentItems(10000);
    return JSON.stringify(items, null, 2);
  }

  async importData(jsonData: string): Promise<number> {
    const items: ClipboardItem[] = JSON.parse(jsonData);
    let count = 0;

    for (const item of items) {
      try {
        await this.db.addItem(item);
        count++;
      } catch {
        // Skip duplicates
      }
    }

    // Update search index
    const allItems = await this.db.getRecentItems(1000);
    this.searchEngine.updateIndex(allItems);

    return count;
  }

  async close(): Promise<void> {
    this.stopMonitoring();
    await this.db.close();
  }
}
