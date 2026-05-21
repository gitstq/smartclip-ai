import { ContentAnalyzer } from '../analyzer';

describe('ContentAnalyzer', () => {
  let analyzer: ContentAnalyzer;

  beforeEach(() => {
    analyzer = new ContentAnalyzer();
  });

  describe('analyze', () => {
    it('should detect JavaScript code', () => {
      const content = 'const x = 5;\nfunction test() { return x; }';
      const result = analyzer.analyze(content);
      
      expect(result.type).toBe('code');
      expect(result.category).toBe('code_snippet');
      expect(result.tags).toContain('code');
      expect(result.tags).toContain('javascript');
    });

    it('should detect Python code', () => {
      const content = 'def hello():\n    print("Hello World")';
      const result = analyzer.analyze(content);
      
      expect(result.type).toBe('code');
      expect(result.tags).toContain('python');
    });

    it('should detect URL', () => {
      const content = 'https://github.com/user/repo';
      const result = analyzer.analyze(content);
      
      expect(result.type).toBe('url');
      expect(result.category).toBe('url_link');
      expect(result.tags).toContain('github');
    });

    it('should detect email', () => {
      const content = 'test@example.com';
      const result = analyzer.analyze(content);
      
      expect(result.type).toBe('email');
      expect(result.category).toBe('email_address');
    });

    it('should detect JSON', () => {
      const content = '{"name": "test", "value": 123}';
      const result = analyzer.analyze(content);
      
      // JSON is detected as code with json tag
      expect(result.tags).toContain('json');
    });

    it('should detect command', () => {
      const content = 'git commit -m "test"';
      const result = analyzer.analyze(content);
      
      expect(result.category).toBe('command');
      expect(result.tags).toContain('command');
    });

    it('should detect sensitive content', () => {
      const content = 'api_key=sk-1234567890abcdef';
      const result = analyzer.analyze(content);
      
      expect(result.category).toBe('password');
      expect(result.tags).toContain('sensitive');
    });

    it('should handle plain text', () => {
      const content = 'This is just a regular note';
      const result = analyzer.analyze(content);
      
      expect(result.type).toBe('text');
      expect(result.tags).toContain('text');
    });
  });

  describe('generateHash', () => {
    it('should generate consistent hash', () => {
      const content = 'test content';
      const hash1 = analyzer.generateHash(content);
      const hash2 = analyzer.generateHash(content);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32);
    });

    it('should generate different hashes for different content', () => {
      const hash1 = analyzer.generateHash('content1');
      const hash2 = analyzer.generateHash('content2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createItem', () => {
    it('should create a complete clipboard item', () => {
      const content = 'const x = 1;';
      const item = analyzer.createItem(content, 'test');
      
      expect(item.id).toBeDefined();
      expect(item.content).toBe(content);
      expect(item.type).toBe('code');
      expect(item.hash).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.source).toBe('test');
    });
  });
});
