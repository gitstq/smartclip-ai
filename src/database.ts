import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { ClipboardItem, SearchOptions, SearchResult, ClipStats, ContentType, ContentCategory } from './types';

export class ClipDatabase {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = '.data/smartclip.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables()
            .then(() => this.createIndexes())
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      `CREATE TABLE IF NOT EXISTS clipboard_items (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0,
        last_accessed_at INTEGER,
        source TEXT,
        hash TEXT UNIQUE NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        count INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS item_tags (
        item_id TEXT,
        tag_id INTEGER,
        FOREIGN KEY (item_id) REFERENCES clipboard_items(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, tag_id)
      )`,
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      'CREATE INDEX IF NOT EXISTS idx_type ON clipboard_items(type)',
      'CREATE INDEX IF NOT EXISTS idx_category ON clipboard_items(category)',
      'CREATE INDEX IF NOT EXISTS idx_created_at ON clipboard_items(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_hash ON clipboard_items(hash)',
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  private run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private get<T>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T || null);
      });
    });
  }

  private all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async addItem(item: ClipboardItem): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.run(
        `INSERT INTO clipboard_items 
         (id, content, type, category, tags, created_at, updated_at, access_count, last_accessed_at, source, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.content,
          item.type,
          item.category,
          JSON.stringify(item.tags),
          item.createdAt,
          item.updatedAt,
          item.accessCount,
          item.lastAccessedAt,
          item.source,
          item.hash,
        ]
      );

      // Update tags
      for (const tag of item.tags) {
        await this.upsertTag(tag);
        const tagRow = await this.get<{ id: number }>('SELECT id FROM tags WHERE name = ?', [tag]);
        if (tagRow) {
          await this.run(
            'INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)',
            [item.id, tagRow.id]
          );
        }
      }

      return true;
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        // Item already exists, update timestamp
        await this.updateItemTimestamp(item.hash);
        return false;
      }
      throw error;
    }
  }

  private async upsertTag(tag: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.run(
      `INSERT INTO tags (name, count) VALUES (?, 1)
       ON CONFLICT(name) DO UPDATE SET count = count + 1`,
      [tag]
    );
  }

  private async updateItemTimestamp(hash: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    await this.run(
      `UPDATE clipboard_items 
       SET updated_at = ?, access_count = access_count + 1, last_accessed_at = ?
       WHERE hash = ?`,
      [now, now, hash]
    );
  }

  async getItemById(id: string): Promise<ClipboardItem | null> {
    const row = await this.get<any>('SELECT * FROM clipboard_items WHERE id = ?', [id]);
    if (!row) return null;
    return this.rowToItem(row);
  }

  async getRecentItems(limit: number = 20): Promise<ClipboardItem[]> {
    const rows = await this.all<any>(
      'SELECT * FROM clipboard_items ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows.map((row: any) => this.rowToItem(row));
  }

  async searchItems(options: SearchOptions): Promise<SearchResult> {
    let sql = 'SELECT * FROM clipboard_items WHERE 1=1';
    const params: any[] = [];

    if (options.query) {
      sql += ' AND (content LIKE ? OR tags LIKE ?)';
      params.push(`%${options.query}%`, `%${options.query}%`);
    }

    if (options.type) {
      sql += ' AND type = ?';
      params.push(options.type);
    }

    if (options.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    if (options.dateFrom) {
      sql += ' AND created_at >= ?';
      params.push(options.dateFrom);
    }

    if (options.dateTo) {
      sql += ' AND created_at <= ?';
      params.push(options.dateTo);
    }

    sql += ' ORDER BY created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = await this.all<any>(sql, params);
    
    // Get total count
    const countSql = 'SELECT COUNT(*) as count FROM clipboard_items';
    const countResult = await this.get<{ count: number }>(countSql);

    return {
      items: rows.map((row: any) => this.rowToItem(row)),
      total: countResult?.count || 0,
      query: options.query || '',
    };
  }

  async deleteItem(id: string): Promise<boolean> {
    await this.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
    return true;
  }

  async deleteOldItems(days: number): Promise<number> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const beforeCount = await this.get<{ count: number }>('SELECT COUNT(*) as count FROM clipboard_items');
    await this.run('DELETE FROM clipboard_items WHERE created_at < ?', [cutoff]);
    const afterCount = await this.get<{ count: number }>('SELECT COUNT(*) as count FROM clipboard_items');
    return (beforeCount?.count || 0) - (afterCount?.count || 0);
  }

  async clearAll(): Promise<void> {
    await this.run('DELETE FROM clipboard_items');
    await this.run('DELETE FROM tags');
    await this.run('DELETE FROM item_tags');
  }

  async getStats(): Promise<ClipStats> {
    const totalResult = await this.get<{ count: number }>('SELECT COUNT(*) as count FROM clipboard_items');
    const totalItems = totalResult?.count || 0;

    // Type distribution
    const typeRows = await this.all<{ type: string; count: number }>(
      'SELECT type, COUNT(*) as count FROM clipboard_items GROUP BY type'
    );
    const typeDistribution: Record<string, number> = {};
    typeRows.forEach((row) => {
      typeDistribution[row.type] = row.count;
    });

    // Category distribution
    const categoryRows = await this.all<{ category: string; count: number }>(
      'SELECT category, COUNT(*) as count FROM clipboard_items GROUP BY category'
    );
    const categoryDistribution: Record<string, number> = {};
    categoryRows.forEach((row) => {
      categoryDistribution[row.category] = row.count;
    });

    // Top tags
    const tagRows = await this.all<{ name: string; count: number }>(
      'SELECT name, count FROM tags ORDER BY count DESC LIMIT 10'
    );
    const topTags = tagRows.map((row) => ({ tag: row.name, count: row.count }));

    // Daily stats (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const dailyRows = await this.all<{ date: string; count: number }>(
      `SELECT 
        date(created_at / 1000, 'unixepoch') as date,
        COUNT(*) as count
       FROM clipboard_items
       WHERE created_at >= ?
       GROUP BY date(created_at / 1000, 'unixepoch')
       ORDER BY date`,
      [sevenDaysAgo]
    );
    const dailyStats = dailyRows.map((row) => ({ date: row.date, count: row.count }));

    return {
      totalItems,
      typeDistribution: typeDistribution as Record<ContentType, number>,
      categoryDistribution: categoryDistribution as Record<ContentCategory, number>,
      topTags,
      dailyStats,
    };
  }

  async getItemsByType(type: string, limit: number = 20): Promise<ClipboardItem[]> {
    const rows = await this.all<any>(
      'SELECT * FROM clipboard_items WHERE type = ? ORDER BY created_at DESC LIMIT ?',
      [type, limit]
    );
    return rows.map((row: any) => this.rowToItem(row));
  }

  async getItemsByCategory(category: string, limit: number = 20): Promise<ClipboardItem[]> {
    const rows = await this.all<any>(
      'SELECT * FROM clipboard_items WHERE category = ? ORDER BY created_at DESC LIMIT ?',
      [category, limit]
    );
    return rows.map((row: any) => this.rowToItem(row));
  }

  async getItemsByTag(tag: string, limit: number = 20): Promise<ClipboardItem[]> {
    const rows = await this.all<any>(
      `SELECT c.* FROM clipboard_items c
       JOIN item_tags it ON c.id = it.item_id
       JOIN tags t ON it.tag_id = t.id
       WHERE t.name = ?
       ORDER BY c.created_at DESC
       LIMIT ?`,
      [tag, limit]
    );
    return rows.map((row: any) => this.rowToItem(row));
  }

  async close(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else {
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  private rowToItem(row: any): ClipboardItem {
    return {
      id: row.id,
      content: row.content,
      type: row.type as ContentType,
      category: row.category as ContentCategory,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accessCount: row.access_count,
      lastAccessedAt: row.last_accessed_at,
      source: row.source,
      hash: row.hash,
    };
  }
}
