# 🧠 SmartClip AI

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
</p>

<p align="center">
  <b>AI-powered semantic clipboard manager with intelligent categorization and natural language search</b>
</p>

<p align="center">
  <a href="#-english">English</a> •
  <a href="#-简体中文">简体中文</a> •
  <a href="#-繁體中文">繁體中文</a>
</p>

---

## 🌐 English

### 🎉 Introduction

**SmartClip AI** is an intelligent clipboard manager that goes beyond simple storage. It uses AI-powered semantic analysis to automatically categorize your clipboard content, making it easy to find what you need when you need it.

**Key Problems Solved:**
- 🔍 Can't find that code snippet you copied yesterday?
- 📋 Lost important links in a sea of clipboard history?
- 🏷️ Wish your clipboard could organize itself automatically?
- 🔎 Want to search clipboard history with natural language?

### ✨ Core Features

| Feature | Description | Emoji |
|---------|-------------|-------|
| **Smart Categorization** | Auto-detects content type (code, URL, email, JSON, etc.) | 🧠 |
| **Semantic Search** | Fuzzy search with Fuse.js for finding content naturally | 🔍 |
| **Tag System** | Automatic tagging + custom tags for organization | 🏷️ |
| **Persistent Storage** | SQLite database keeps history across reboots | 💾 |
| **Real-time Monitor** | Background monitoring captures clipboard changes | 👁️ |
| **Statistics** | Visualize your clipboard usage patterns | 📊 |
| **Cross-platform** | Works on Windows, macOS, and Linux | 🖥️ |
| **Privacy First** | 100% local - no data leaves your machine | 🔒 |

### 🚀 Quick Start

#### Requirements
- **Node.js** >= 18.0.0
- **npm** or **yarn**

#### Installation

```bash
# Install globally
npm install -g smartclip-ai

# Or use npx (no installation)
npx smartclip-ai
```

#### Basic Usage

```bash
# Start clipboard monitoring
smartclip monitor

# Add current clipboard content manually
smartclip add

# List recent items
smartclip list

# Search clipboard history
smartclip search "javascript function"

# Interactive mode
smartclip interactive
```

### 📖 Detailed Usage

#### CLI Commands

```bash
# Monitor clipboard in real-time
smartclip monitor

# Add current clipboard
smartclip add

# List recent items (default: 20)
smartclip list
smartclip list -n 50

# Filter by type
smartclip list -t code
smartclip list -c url_link

# Search with fuzzy matching
smartclip search "api endpoint"
smartclip search "github" -l 10

# Copy item back to clipboard
smartclip copy <item-id>

# Delete an item
smartclip delete <item-id>

# View statistics
smartclip stats

# Export data
smartclip export backup.json

# Import data
smartclip import backup.json

# Clear all data
smartclip clear

# Interactive TUI mode
smartclip interactive
```

#### Content Types Detected

| Type | Description | Example |
|------|-------------|---------|
| `code` | Programming code snippets | `const x = 5;` |
| `url` | Web links | `https://github.com` |
| `email` | Email addresses | `user@example.com` |
| `json` | JSON data | `{"key": "value"}` |
| `image` | Image file paths | `/path/to/image.png` |
| `text` | Plain text content | Notes, paragraphs |

#### Categories

- `code_snippet` - Programming code
- `url_link` - Web URLs
- `email_address` - Email addresses
- `command` - CLI commands
- `json_data` - JSON content
- `note` - Text notes
- `image_path` - Image references

### 💡 Design Philosophy

SmartClip AI was designed with these principles:

1. **Zero-config setup** - Works out of the box
2. **Privacy by default** - All data stays local
3. **Intelligent organization** - AI categorization reduces manual work
4. **Fast retrieval** - Fuzzy search finds content quickly
5. **Developer-friendly** - Perfect for code snippets and commands

### 📦 Development

```bash
# Clone repository
git clone https://github.com/gitstq/smartclip-ai.git
cd smartclip-ai

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev

# Lint
npm run lint
```

### 📦 Packaging

```bash
# Package for current platform
npm run package

# Package for all platforms
npm run package:all
```

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🇨🇳 简体中文

### 🎉 项目介绍

**SmartClip AI** 是一款智能剪贴板管理工具，它超越了简单的存储功能。利用 AI 语义分析技术，自动对剪贴板内容进行分类，让您在需要时轻松找到所需内容。

**解决的核心问题：**
- 🔍 找不到昨天复制的代码片段？
- 📋 重要链接淹没在剪贴板历史中？
- 🏷️ 希望剪贴板能自动整理？
- 🔎 想用自然语言搜索剪贴板历史？

### ✨ 核心特性

| 特性 | 描述 | 图标 |
|------|------|------|
| **智能分类** | 自动检测内容类型（代码、URL、邮箱、JSON 等） | 🧠 |
| **语义搜索** | 基于 Fuse.js 的模糊搜索，自然语言查找 | 🔍 |
| **标签系统** | 自动标签 + 自定义标签，轻松组织 | 🏷️ |
| **持久存储** | SQLite 数据库，重启后历史不丢失 | 💾 |
| **实时监控** | 后台监控，自动捕获剪贴板变化 | 👁️ |
| **统计分析** | 可视化展示剪贴板使用模式 | 📊 |
| **跨平台** | 支持 Windows、macOS 和 Linux | 🖥️ |
| **隐私优先** | 100% 本地运行，数据不出本机 | 🔒 |

### 🚀 快速开始

#### 环境要求
- **Node.js** >= 18.0.0
- **npm** 或 **yarn**

#### 安装

```bash
# 全局安装
npm install -g smartclip-ai

# 或使用 npx（无需安装）
npx smartclip-ai
```

#### 基本用法

```bash
# 启动剪贴板监控
smartclip monitor

# 手动添加当前剪贴板内容
smartclip add

# 列出最近的项目
smartclip list

# 搜索剪贴板历史
smartclip search "javascript 函数"

# 交互式模式
smartclip interactive
```

### 📖 详细使用指南

#### CLI 命令

```bash
# 实时监控剪贴板
smartclip monitor

# 添加当前剪贴板
smartclip add

# 列出最近项目（默认：20）
smartclip list
smartclip list -n 50

# 按类型筛选
smartclip list -t code
smartclip list -c url_link

# 模糊搜索
smartclip search "api 接口"
smartclip search "github" -l 10

# 复制项目回剪贴板
smartclip copy <项目ID>

# 删除项目
smartclip delete <项目ID>

# 查看统计
smartclip stats

# 导出数据
smartclip export backup.json

# 导入数据
smartclip import backup.json

# 清空所有数据
smartclip clear

# 交互式 TUI 模式
smartclip interactive
```

#### 检测的内容类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `code` | 编程代码片段 | `const x = 5;` |
| `url` | 网页链接 | `https://github.com` |
| `email` | 邮箱地址 | `user@example.com` |
| `json` | JSON 数据 | `{"key": "value"}` |
| `image` | 图片文件路径 | `/path/to/image.png` |
| `text` | 纯文本内容 | 笔记、段落 |

#### 内容分类

- `code_snippet` - 编程代码
- `url_link` - 网页 URL
- `email_address` - 邮箱地址
- `command` - 命令行命令
- `json_data` - JSON 内容
- `note` - 文本笔记
- `image_path` - 图片引用

### 💡 设计理念

SmartClip AI 遵循以下设计原则：

1. **零配置** - 开箱即用
2. **隐私优先** - 所有数据本地存储
3. **智能组织** - AI 分类减少手动工作
4. **快速检索** - 模糊搜索快速找到内容
5. **开发者友好** - 完美适配代码片段和命令

### 📦 开发指南

```bash
# 克隆仓库
git clone https://github.com/gitstq/smartclip-ai.git
cd smartclip-ai

# 安装依赖
npm install

# 构建
npm run build

# 运行测试
npm test

# 开发模式
npm run dev

# 代码检查
npm run lint
```

### 📦 打包发布

```bash
# 打包当前平台
npm run package

# 打包所有平台
npm run package:all
```

### 🤝 贡献指南

欢迎贡献！请按以下步骤操作：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件。

---

## 🇹🇼 繁體中文

### 🎉 項目介紹

**SmartClip AI** 是一款智能剪貼簿管理工具，它超越了簡單的存儲功能。利用 AI 語義分析技術，自動對剪貼簿內容進行分類，讓您在需要時輕鬆找到所需內容。

**解決的核心問題：**
- 🔍 找不到昨天複製的代碼片段？
- 📋 重要連結淹沒在剪貼簿歷史中？
- 🏷️ 希望剪貼簿能自動整理？
- 🔎 想用自然語言搜索剪貼簿歷史？

### ✨ 核心特性

| 特性 | 描述 | 圖標 |
|------|------|------|
| **智能分類** | 自動檢測內容類型（代碼、URL、郵箱、JSON 等） | 🧠 |
| **語義搜索** | 基於 Fuse.js 的模糊搜索，自然語言查找 | 🔍 |
| **標籤系統** | 自動標籤 + 自定義標籤，輕鬆組織 | 🏷️ |
| **持久存儲** | SQLite 數據庫，重啟後歷史不丟失 | 💾 |
| **實時監控** | 後台監控，自動捕獲剪貼簿變化 | 👁️ |
| **統計分析** | 可視化展示剪貼簿使用模式 | 📊 |
| **跨平台** | 支持 Windows、macOS 和 Linux | 🖥️ |
| **隱私優先** | 100% 本地運行，數據不出本機 | 🔒 |

### 🚀 快速開始

#### 環境要求
- **Node.js** >= 18.0.0
- **npm** 或 **yarn**

#### 安裝

```bash
# 全局安裝
npm install -g smartclip-ai

# 或使用 npx（無需安裝）
npx smartclip-ai
```

#### 基本用法

```bash
# 啟動剪貼簿監控
smartclip monitor

# 手動添加當前剪貼簿內容
smartclip add

# 列出最近的項目
smartclip list

# 搜索剪貼簿歷史
smartclip search "javascript 函數"

# 交互式模式
smartclip interactive
```

### 📖 詳細使用指南

#### CLI 命令

```bash
# 實時監控剪貼簿
smartclip monitor

# 添加當前剪貼簿
smartclip add

# 列出最近項目（默認：20）
smartclip list
smartclip list -n 50

# 按類型篩選
smartclip list -t code
smartclip list -c url_link

# 模糊搜索
smartclip search "api 接口"
smartclip search "github" -l 10

# 複製項目回剪貼簿
smartclip copy <項目ID>

# 刪除項目
smartclip delete <項目ID>

# 查看統計
smartclip stats

# 導出數據
smartclip export backup.json

# 導入數據
smartclip import backup.json

# 清空所有數據
smartclip clear

# 交互式 TUI 模式
smartclip interactive
```

#### 檢測的內容類型

| 類型 | 描述 | 示例 |
|------|------|------|
| `code` | 編程代碼片段 | `const x = 5;` |
| `url` | 網頁連結 | `https://github.com` |
| `email` | 郵箱地址 | `user@example.com` |
| `json` | JSON 數據 | `{"key": "value"}` |
| `image` | 圖片文件路徑 | `/path/to/image.png` |
| `text` | 純文本內容 | 筆記、段落 |

#### 內容分類

- `code_snippet` - 編程代碼
- `url_link` - 網頁 URL
- `email_address` - 郵箱地址
- `command` - 命令行命令
- `json_data` - JSON 內容
- `note` - 文本筆記
- `image_path` - 圖片引用

### 💡 設計理念

SmartClip AI 遵循以下設計原則：

1. **零配置** - 開箱即用
2. **隱私優先** - 所有數據本地存儲
3. **智能組織** - AI 分類減少手動工作
4. **快速檢索** - 模糊搜索快速找到內容
5. **開發者友好** - 完美適配代碼片段和命令

### 📦 開發指南

```bash
# 克隆倉庫
git clone https://github.com/gitstq/smartclip-ai.git
cd smartclip-ai

# 安裝依賴
npm install

# 構建
npm run build

# 運行測試
npm test

# 開發模式
npm run dev

# 代碼檢查
npm run lint
```

### 📦 打包發布

```bash
# 打包當前平台
npm run package

# 打包所有平台
npm run package:all
```

### 🤝 貢獻指南

歡迎貢獻！請按以下步驟操作：

1. Fork 本倉庫
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 創建 Pull Request

### 📄 開源協議

本項目採用 MIT 協議 - 詳見 [LICENSE](LICENSE) 文件。
