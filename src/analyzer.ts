/**
 * SmartClip AI - Content Analyzer
 * Analyzes clipboard content to determine type, category, and tags
 */

import { ContentType, ContentCategory, ContentAnalyzerResult, ClipboardItem } from './types';
import * as crypto from 'crypto';

export class ContentAnalyzer {
  /**
   * Analyze content and return classification result
   */
  analyze(content: string): ContentAnalyzerResult {
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      return {
        type: 'text',
        category: 'plain_text',
        tags: ['empty'],
        confidence: 1.0,
      };
    }

    // Check for code
    const codeResult = this.detectCode(trimmed);
    if (codeResult.isCode && codeResult.confidence > 0.7) {
      return {
        type: 'code',
        category: codeResult.category,
        tags: codeResult.tags,
        confidence: codeResult.confidence,
      };
    }

    // Check for URL
    if (this.isUrl(trimmed)) {
      return {
        type: 'url',
        category: 'url_link',
        tags: this.extractUrlTags(trimmed),
        confidence: 0.95,
      };
    }

    // Check for email
    if (this.isEmail(trimmed)) {
      return {
        type: 'email',
        category: 'email_address',
        tags: ['email', 'contact'],
        confidence: 0.95,
      };
    }

    // Check for JSON
    if (this.isJson(trimmed)) {
      return {
        type: 'json',
        category: 'json_data',
        tags: ['json', 'data'],
        confidence: 0.9,
      };
    }

    // Check for image path
    if (this.isImagePath(trimmed)) {
      return {
        type: 'image',
        category: 'image_path',
        tags: ['image', 'media'],
        confidence: 0.9,
      };
    }

    // Check for command
    if (this.isCommand(trimmed)) {
      return {
        type: 'text',
        category: 'command',
        tags: ['command', 'cli'],
        confidence: 0.8,
      };
    }

    // Check for API key or password patterns
    if (this.isSensitive(trimmed)) {
      return {
        type: 'text',
        category: 'password',
        tags: ['sensitive', 'security'],
        confidence: 0.7,
      };
    }

    // Default to plain text
    return {
      type: 'text',
      category: 'note',
      tags: this.extractTextTags(trimmed),
      confidence: 0.5,
    };
  }

  /**
   * Detect if content is code
   */
  private detectCode(content: string): { isCode: boolean; category: ContentCategory; tags: string[]; confidence: number } {
    const codePatterns = [
      { pattern: /^(const|let|var|function|class|import|export|async|await)\s/m, lang: 'javascript', tags: ['javascript', 'js'] },
      { pattern: /^(def|class|import|from|if\s+__name__)/m, lang: 'python', tags: ['python', 'py'] },
      { pattern: /^(package|import|func|type|struct|interface|const|var)\s/m, lang: 'go', tags: ['go', 'golang'] },
      { pattern: /^(#include|#define|int\s+main|void\s+|class\s+\w+\s*\{)/m, lang: 'cpp', tags: ['cpp', 'c++'] },
      { pattern: /^(public|private|protected|class|interface|enum|namespace)\s/m, lang: 'csharp', tags: ['csharp', 'dotnet'] },
      { pattern: /^(<?php|namespace|use\s+\w+)/m, lang: 'php', tags: ['php'] },
      { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s/i, lang: 'sql', tags: ['sql', 'database'] },
      { pattern: /^(<!DOCTYPE|<html|<head|<body|<div|<script|<style)/i, lang: 'html', tags: ['html', 'markup'] },
      { pattern: /^(\{|\[)\s*"\w+":/m, lang: 'json', tags: ['json'] },
      { pattern: /^\s*\.\w+\s*\{/, lang: 'css', tags: ['css', 'stylesheet'] },
      { pattern: /^(bash|sh|#\!\/bin\/|#\!\/usr\/bin\/env)/m, lang: 'bash', tags: ['bash', 'shell', 'script'] },
      { pattern: /^(docker|kubectl|helm|terraform)/m, lang: 'devops', tags: ['devops', 'infrastructure'] },
    ];

    for (const { pattern, lang, tags } of codePatterns) {
      if (pattern.test(content)) {
        return {
          isCode: true,
          category: 'code_snippet',
          tags: ['code', lang, ...tags],
          confidence: 0.85,
        };
      }
    }

    // Check for code-like structure (brackets, semicolons, etc.)
    const codeIndicators = [
      /[{};]/.test(content),
      /=\s*>/.test(content),
      /function\s*\w*\s*\(/.test(content),
      /if\s*\(.+\)\s*\{/.test(content),
      /for\s*\(.+\)\s*\{/.test(content),
    ];
    
    const codeScore = codeIndicators.filter(Boolean).length / codeIndicators.length;
    
    if (codeScore > 0.5) {
      return {
        isCode: true,
        category: 'code_snippet',
        tags: ['code', 'snippet'],
        confidence: codeScore,
      };
    }

    return { isCode: false, category: 'plain_text', tags: [], confidence: 0 };
  }

  /**
   * Check if content is a URL
   */
  private isUrl(content: string): boolean {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return urlPattern.test(content);
  }

  /**
   * Check if content is an email
   */
  private isEmail(content: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(content);
  }

  /**
   * Check if content is valid JSON
   */
  private isJson(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if content is an image path
   */
  private isImagePath(content: string): boolean {
    const imagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i;
    return imagePattern.test(content);
  }

  /**
   * Check if content looks like a command
   */
  private isCommand(content: string): boolean {
    const commandPatterns = [
      /^(npm|yarn|pnpm|npx)\s/,
      /^(git|docker|kubectl|terraform|aws|gcloud|az)\s/,
      /^(cd|ls|cat|grep|find|curl|wget|ssh|scp)\s/,
      /^(python|node|go|rustc|javac)\s/,
      /^(make|cmake|gcc|g\+\+|clang)\s/,
    ];
    return commandPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content contains sensitive information
   */
  private isSensitive(content: string): boolean {
    const sensitivePatterns = [
      /^(sk-|pk-|AKIA|ghp_|glpat-)/i,
      /password\s*[:=]\s*\S+/i,
      /api[_-]?key\s*[:=]\s*\S+/i,
      /token\s*[:=]\s*\S+/i,
      /secret\s*[:=]\s*\S+/i,
      /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/,
    ];
    return sensitivePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract tags from URL
   */
  private extractUrlTags(url: string): string[] {
    const tags = ['url', 'link'];
    
    if (url.includes('github.com')) tags.push('github');
    if (url.includes('stackoverflow.com')) tags.push('stackoverflow', 'reference');
    if (url.includes('docs.') || url.includes('documentation')) tags.push('documentation');
    if (url.includes('youtube.com') || url.includes('vimeo.com')) tags.push('video');
    if (url.includes('medium.com') || url.includes('blog.')) tags.push('article', 'blog');
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) tags.push('image');
    
    return tags;
  }

  /**
   * Extract tags from plain text
   */
  private extractTextTags(content: string): string[] {
    const tags: string[] = ['text'];
    
    if (content.length > 500) tags.push('long-text');
    if (content.includes('# ') || content.includes('## ')) tags.push('markdown');
    if (/\d{4}-\d{2}-\d{2}/.test(content)) tags.push('date');
    if (/\$\d+/.test(content) || /\d+\.\d{2}/.test(content)) tags.push('money');
    if (content.includes('@')) tags.push('mention');
    if (/#\w+/.test(content)) tags.push('hashtag');
    
    return tags;
  }

  /**
   * Generate unique hash for content
   */
  generateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate unique ID
   */
  generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a ClipboardItem from content
   */
  createItem(content: string, source?: string): ClipboardItem {
    const analysis = this.analyze(content);
    const now = Date.now();
    
    return {
      id: this.generateId(),
      content,
      type: analysis.type,
      category: analysis.category,
      tags: analysis.tags,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      lastAccessedAt: null,
      source: source || null,
      hash: this.generateHash(content),
    };
  }
}