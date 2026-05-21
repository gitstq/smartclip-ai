/**
 * SmartClip AI - Main Entry Point
 */

export { SmartClipManager } from './manager';
export { ClipDatabase } from './database';
export { ClipboardMonitor } from './clipboard';
export { ContentAnalyzer } from './analyzer';
export { SearchEngine } from './search';
export * from './types';

// Default export
import { SmartClipManager } from './manager';
export default SmartClipManager;