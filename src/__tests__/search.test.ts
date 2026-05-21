import { SearchEngine } from '../search';
import { ClipboardItem } from '../types';

describe('SearchEngine', () => {
  let engine: SearchEngine;
  let items: ClipboardItem[];

  beforeEach(() => {
    engine = new SearchEngine();
    items = [
      {
        id: '1',
        content: 'const x = 5;',
        type: 'code',
        category: 'code_snippet',
        tags: ['javascript', 'variable'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessCount: 0,
        lastAccessedAt: null,
        source: null,
        hash: 'hash1',
      },
      {
        id: '2',
        content: 'https://github.com/test',
        type: 'url',
        category: 'url_link',
        tags: ['github', 'link'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessCount: 0,
        lastAccessedAt: null,
        source: null,
        hash: 'hash2',
      },
      {
        id: '3',
        content: 'def hello(): pass',
        type: 'code',
        category: 'code_snippet',
        tags: ['python', 'function'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessCount: 0,
        lastAccessedAt: null,
        source: null,
        hash: 'hash3',
      },
    ];
    engine.updateIndex(items);
  });

  describe('search', () => {
    it('should find items by query', () => {
      const result = engine.search({ query: 'javascript', limit: 10 });
      
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter by type', () => {
      const result = engine.search({ query: '', type: 'code', limit: 10 });
      
      expect(result.items.every(item => item.type === 'code')).toBe(true);
    });

    it('should filter by category', () => {
      const result = engine.search({ query: '', category: 'url_link', limit: 10 });
      
      expect(result.items.every(item => item.category === 'url_link')).toBe(true);
    });

    it('should filter by tags', () => {
      const result = engine.search({ query: '', tags: ['python'], limit: 10 });
      
      expect(result.items.every(item => item.tags.includes('python'))).toBe(true);
    });

    it('should respect limit', () => {
      const result = engine.search({ query: '', limit: 2 });
      
      expect(result.items.length).toBeLessThanOrEqual(2);
    });
  });

  describe('searchByType', () => {
    it('should return items of specific type', () => {
      const results = engine.searchByType('code');
      
      expect(results.length).toBe(2);
      expect(results.every(item => item.type === 'code')).toBe(true);
    });
  });

  describe('searchByTags', () => {
    it('should return items with matching tags', () => {
      const results = engine.searchByTags(['github']);
      
      expect(results.length).toBe(1);
      expect(results[0].tags).toContain('github');
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags', () => {
      const tags = engine.getAllTags();
      
      expect(tags).toContain('javascript');
      expect(tags).toContain('python');
      expect(tags).toContain('github');
    });
  });

  describe('clear', () => {
    it('should clear the index', () => {
      engine.clear();
      const result = engine.search({ query: 'javascript' });
      
      expect(result.items.length).toBe(0);
    });
  });
});
