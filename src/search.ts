/**
 * SmartClip AI - Search Engine
 * Provides fuzzy search and filtering capabilities
 */

import Fuse from 'fuse.js';
import { ClipboardItem, SearchOptions, SearchResult } from './types';

export class SearchEngine {
  private fuse: Fuse<ClipboardItem> | null = null;
  private items: ClipboardItem[] = [];

  private readonly fuseOptions: any = {
    keys: [
      { name: 'content', weight: 0.5 },
      { name: 'tags', weight: 0.3 },
      { name: 'category', weight: 0.1 },
      { name: 'type', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  };

  /**
   * Update the search index with new items
   */
  updateIndex(items: ClipboardItem[]): void {
    this.items = items;
    this.fuse = new Fuse(items, this.fuseOptions);
  }

  /**
   * Perform fuzzy search
   */
  search(options: SearchOptions): SearchResult {
    const { query, type, category, tags, dateFrom, dateTo, limit = 50, fuzzy = true } = options;

    let results: ClipboardItem[] = [];

    if (fuzzy && this.fuse && query) {
      const fuseResults = this.fuse.search(query);
      results = fuseResults.map(result => result.item);
    } else if (query) {
      // Simple substring search
      const lowerQuery = query.toLowerCase();
      results = this.items.filter(item =>
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } else {
      results = [...this.items];
    }

    // Apply filters
    if (type) {
      results = results.filter(item => item.type === type);
    }

    if (category) {
      results = results.filter(item => item.category === category);
    }

    if (tags && tags.length > 0) {
      results = results.filter(item =>
        tags.some(tag => item.tags.includes(tag))
      );
    }

    if (dateFrom) {
      results = results.filter(item => item.createdAt >= dateFrom);
    }

    if (dateTo) {
      results = results.filter(item => item.createdAt <= dateTo);
    }

    // Sort by created date (newest first)
    results.sort((a, b) => b.createdAt - a.createdAt);

    const total = results.length;

    // Apply limit
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    return {
      items: results,
      total,
      query: query || '',
    };
  }

  /**
   * Search by content type
   */
  searchByType(type: string): ClipboardItem[] {
    return this.items.filter(item => item.type === type);
  }

  /**
   * Search by category
   */
  searchByCategory(category: string): ClipboardItem[] {
    return this.items.filter(item => item.category === category);
  }

  /**
   * Search by tags
   */
  searchByTags(tags: string[]): ClipboardItem[] {
    return this.items.filter(item =>
      tags.some(tag => item.tags.includes(tag))
    );
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Get all content types
   */
  getAllTypes(): string[] {
    const typeSet = new Set<string>();
    this.items.forEach(item => typeSet.add(item.type));
    return Array.from(typeSet).sort();
  }

  /**
   * Get all categories
   */
  getAllCategories(): string[] {
    const categorySet = new Set<string>();
    this.items.forEach(item => categorySet.add(item.category));
    return Array.from(categorySet).sort();
  }

  /**
   * Clear the search index
   */
  clear(): void {
    this.items = [];
    this.fuse = null;
  }
}
