/**
 * SmartClip AI - Clipboard Monitor
 * Monitors system clipboard for changes
 */

import clipboard from 'clipboardy';
import { EventEmitter } from 'events';
import { ClipboardItem } from './types';
import { ContentAnalyzer } from './analyzer';

export interface ClipboardMonitorOptions {
  interval?: number;
  skipDuplicates?: boolean;
  maxLength?: number;
}

export class ClipboardMonitor extends EventEmitter {
  private isRunning = false;
  private lastContent: string = '';
  private intervalId: NodeJS.Timeout | null = null;
  private analyzer: ContentAnalyzer;
  private options: Required<ClipboardMonitorOptions>;

  constructor(options: ClipboardMonitorOptions = {}) {
    super();
    this.analyzer = new ContentAnalyzer();
    this.options = {
      interval: options.interval || 500,
      skipDuplicates: options.skipDuplicates !== false,
      maxLength: options.maxLength || 100000,
    };
  }

  /**
   * Start monitoring clipboard
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('started');

    this.intervalId = setInterval(async () => {
      await this.checkClipboard();
    }, this.options.interval);
  }

  /**
   * Stop monitoring clipboard
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit('stopped');
  }

  /**
   * Check clipboard for changes
   */
  private async checkClipboard(): Promise<void> {
    try {
      const content = await clipboard.read();

      // Skip if same as last content
      if (this.options.skipDuplicates && content === this.lastContent) {
        return;
      }

      // Skip if too long
      if (content.length > this.options.maxLength) {
        this.emit('skipped', content, 'Content too long');
        return;
      }

      // Skip if empty
      if (!content || content.trim().length === 0) {
        return;
      }

      this.lastContent = content;
      
      const item = this.analyzer.createItem(content, 'clipboard');
      this.emit('change', item);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Read current clipboard content
   */
  async read(): Promise<string> {
    return clipboard.read();
  }

  /**
   * Write content to clipboard
   */
  async write(content: string): Promise<void> {
    await clipboard.write(content);
    this.lastContent = content;
  }

  /**
   * Check if monitor is running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get last captured content
   */
  getLastContent(): string {
    return this.lastContent;
  }
}
