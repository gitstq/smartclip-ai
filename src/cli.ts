#!/usr/bin/env node

/**
 * SmartClip AI - CLI Interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { SmartClipManager } from './manager';
import { ClipboardItem } from './types';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();
const manager = new SmartClipManager();

// Helper functions
function formatItem(item: ClipboardItem, index?: number): string {
  const prefix = index !== undefined ? `${chalk.gray(`[${index}]`)} ` : '';
  const typeIcon = getTypeIcon(item.type);
  const preview = item.content.length > 60 
    ? item.content.substring(0, 60) + '...' 
    : item.content;
  const tags = item.tags.slice(0, 3).map(t => chalk.cyan(`#${t}`)).join(' ');
  
  return `${prefix}${typeIcon} ${chalk.white(preview)} ${tags}`;
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    text: '📝',
    code: '💻',
    url: '🔗',
    email: '📧',
    image: '🖼️',
    json: '📊',
    other: '📄',
  };
  return icons[type] || '📄';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Initialize
async function init() {
  const spinner = ora('Initializing SmartClip AI...').start();
  try {
    await manager.initialize();
    spinner.succeed('SmartClip AI initialized');
  } catch (error) {
    spinner.fail('Failed to initialize');
    console.error(error);
    process.exit(1);
  }
}

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n👋 Goodbye!'));
  await manager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await manager.close();
  process.exit(0);
});

program
  .name('smartclip')
  .description('AI-powered semantic clipboard manager')
  .version('1.0.0');

// Start monitoring
program
  .command('monitor')
  .description('Start clipboard monitoring')
  .action(async () => {
    await init();
    console.log(chalk.green('🔍 Clipboard monitoring started'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    manager.startMonitoring();
  });

// Add current clipboard
program
  .command('add')
  .description('Add current clipboard content')
  .action(async () => {
    await init();
    const spinner = ora('Reading clipboard...').start();
    
    try {
      const item = await manager.addFromClipboard();
      if (item) {
        spinner.succeed('Added to SmartClip');
        console.log(formatItem(item));
      } else {
        spinner.fail('Clipboard is empty');
      }
    } catch (error) {
      spinner.fail('Failed to add');
      console.error(error);
    }
    
    await manager.close();
  });

// List recent items
program
  .command('list')
  .alias('ls')
  .description('List recent clipboard items')
  .option('-n, --number <number>', 'Number of items to show', '20')
  .option('-t, --type <type>', 'Filter by type')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (options) => {
    await init();
    const limit = parseInt(options.number);
    
    let items: ClipboardItem[];
    
    if (options.type) {
      items = await manager.getByType(options.type, limit);
    } else if (options.category) {
      items = await manager.getByCategory(options.category, limit);
    } else {
      items = await manager.getRecent(limit);
    }
    
    if (items.length === 0) {
      console.log(chalk.yellow('📭 No items found'));
    } else {
      console.log(chalk.blue(`📋 Found ${items.length} items:\n`));
      items.forEach((item, i) => {
        console.log(formatItem(item, i + 1));
        console.log(chalk.gray(`   ${formatDate(item.createdAt)} | ${item.category}`));
        console.log();
      });
    }
    
    await manager.close();
  });

// Search items
program
  .command('search')
  .alias('s')
  .description('Search clipboard items')
  .argument('<query>', 'Search query')
  .option('-l, --limit <number>', 'Limit results', '20')
  .option('-f, --fuzzy', 'Use fuzzy search', true)
  .action(async (query, options) => {
    await init();
    const spinner = ora('Searching...').start();
    
    try {
      const result = await manager.fuzzySearch(query, parseInt(options.limit));
      spinner.stop();
      
      if (result.items.length === 0) {
        console.log(chalk.yellow('🔍 No results found'));
      } else {
        console.log(chalk.blue(`🔍 Found ${result.total} results for "${query}":\n`));
        result.items.forEach((item, i) => {
          console.log(formatItem(item, i + 1));
          console.log(chalk.gray(`   ${formatDate(item.createdAt)} | ${item.category}`));
          console.log();
        });
      }
    } catch (error) {
      spinner.fail('Search failed');
      console.error(error);
    }
    
    await manager.close();
  });

// Copy item to clipboard
program
  .command('copy')
  .alias('cp')
  .description('Copy item to clipboard')
  .argument('<id>', 'Item ID')
  .action(async (id) => {
    await init();
    const spinner = ora('Copying...').start();
    
    try {
      const success = await manager.copyToClipboard(id);
      if (success) {
        spinner.succeed('Copied to clipboard');
      } else {
        spinner.fail('Item not found');
      }
    } catch (error) {
      spinner.fail('Failed to copy');
      console.error(error);
    }
    
    await manager.close();
  });

// Delete item
program
  .command('delete')
  .alias('rm')
  .description('Delete an item')
  .argument('<id>', 'Item ID')
  .action(async (id) => {
    await init();
    const spinner = ora('Deleting...').start();
    
    try {
      const success = await manager.deleteItem(id);
      if (success) {
        spinner.succeed('Item deleted');
      } else {
        spinner.fail('Item not found');
      }
    } catch (error) {
      spinner.fail('Failed to delete');
      console.error(error);
    }
    
    await manager.close();
  });

// Show stats
program
  .command('stats')
  .description('Show clipboard statistics')
  .action(async () => {
    await init();
    const spinner = ora('Loading stats...').start();
    
    try {
      const stats = await manager.getStats();
      spinner.stop();
      
      console.log(chalk.blue('📊 SmartClip Statistics\n'));
      console.log(`Total Items: ${chalk.bold(stats.totalItems)}`);
      
      console.log(chalk.yellow('\n📁 By Type:'));
      Object.entries(stats.typeDistribution).forEach(([type, count]) => {
        console.log(`  ${getTypeIcon(type)} ${type}: ${count}`);
      });
      
      console.log(chalk.yellow('\n🏷️ Top Tags:'));
      stats.topTags.slice(0, 10).forEach(({ tag, count }) => {
        console.log(`  #${tag}: ${count}`);
      });
      
      if (stats.dailyStats.length > 0) {
        console.log(chalk.yellow('\n📈 Recent Activity:'));
        stats.dailyStats.slice(-7).forEach(({ date, count }) => {
          console.log(`  ${date}: ${count} items`);
        });
      }
    } catch (error) {
      spinner.fail('Failed to load stats');
      console.error(error);
    }
    
    await manager.close();
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Interactive mode')
  .action(async () => {
    await init();
    
    console.log(chalk.green('🚀 SmartClip AI Interactive Mode\n'));
    
    let running = true;
    while (running) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 View recent items', value: 'list' },
            { name: '🔍 Search items', value: 'search' },
            { name: '📊 View statistics', value: 'stats' },
            { name: '📋 Copy item to clipboard', value: 'copy' },
            { name: '🗑️ Delete item', value: 'delete' },
            { name: '🔍 Start monitoring', value: 'monitor' },
            { name: '👋 Exit', value: 'exit' },
          ],
        },
      ]);

      switch (action) {
        case 'list':
          const items = await manager.getRecent(10);
          if (items.length === 0) {
            console.log(chalk.yellow('📭 No items found'));
          } else {
            console.log(chalk.blue('\nRecent items:\n'));
            items.forEach((item, i) => {
              console.log(formatItem(item, i + 1));
              console.log();
            });
          }
          break;

        case 'search':
          const { query } = await inquirer.prompt([
            { type: 'input', name: 'query', message: 'Search query:' },
          ]);
          const result = await manager.fuzzySearch(query, 10);
          if (result.items.length === 0) {
            console.log(chalk.yellow('🔍 No results found'));
          } else {
            console.log(chalk.blue(`\nFound ${result.total} results:\n`));
            result.items.forEach((item, i) => {
              console.log(formatItem(item, i + 1));
              console.log();
            });
          }
          break;

        case 'stats':
          const stats = await manager.getStats();
          console.log(chalk.blue('\n📊 Statistics\n'));
          console.log(`Total Items: ${chalk.bold(stats.totalItems)}`);
          console.log(chalk.yellow('\nBy Type:'));
          Object.entries(stats.typeDistribution).forEach(([type, count]) => {
            console.log(`  ${getTypeIcon(type)} ${type}: ${count}`);
          });
          break;

        case 'copy':
          const { copyId } = await inquirer.prompt([
            { type: 'input', name: 'copyId', message: 'Enter item ID:' },
          ]);
          const copySuccess = await manager.copyToClipboard(copyId);
          console.log(copySuccess 
            ? chalk.green('✅ Copied to clipboard') 
            : chalk.red('❌ Item not found')
          );
          break;

        case 'delete':
          const { deleteId } = await inquirer.prompt([
            { type: 'input', name: 'deleteId', message: 'Enter item ID:' },
          ]);
          const deleteSuccess = await manager.deleteItem(deleteId);
          console.log(deleteSuccess 
            ? chalk.green('✅ Item deleted') 
            : chalk.red('❌ Item not found')
          );
          break;

        case 'monitor':
          console.log(chalk.green('🔍 Starting clipboard monitoring...'));
          console.log(chalk.gray('Press Ctrl+C to stop'));
          manager.startMonitoring();
          await new Promise(() => {}); // Keep running
          break;

        case 'exit':
          running = false;
          break;
      }

      console.log();
    }

    console.log(chalk.yellow('👋 Goodbye!'));
    await manager.close();
  });

// Export data
program
  .command('export')
  .description('Export clipboard data to JSON')
  .argument('[filepath]', 'Output file path', 'smartclip-export.json')
  .action(async (filepath) => {
    await init();
    const spinner = ora('Exporting...').start();
    
    try {
      const data = await manager.exportData();
      fs.writeFileSync(filepath, data);
      spinner.succeed(`Exported to ${filepath}`);
    } catch (error) {
      spinner.fail('Export failed');
      console.error(error);
    }
    
    await manager.close();
  });

// Import data
program
  .command('import')
  .description('Import clipboard data from JSON')
  .argument('<filepath>', 'Input file path')
  .action(async (filepath) => {
    await init();
    
    if (!fs.existsSync(filepath)) {
      console.log(chalk.red(`File not found: ${filepath}`));
      return;
    }
    
    const spinner = ora('Importing...').start();
    
    try {
      const data = fs.readFileSync(filepath, 'utf-8');
      const count = await manager.importData(data);
      spinner.succeed(`Imported ${count} items`);
    } catch (error) {
      spinner.fail('Import failed');
      console.error(error);
    }
    
    await manager.close();
  });

// Clear all data
program
  .command('clear')
  .description('Clear all clipboard data')
  .action(async () => {
    await init();
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.red('⚠️ Are you sure you want to delete all data?'),
        default: false,
      },
    ]);

    if (confirm) {
      const spinner = ora('Clearing...').start();
      try {
        await manager.clearAll();
        spinner.succeed('All data cleared');
      } catch (error) {
        spinner.fail('Failed to clear');
        console.error(error);
      }
    }
    
    await manager.close();
  });

// Run
program.parse();