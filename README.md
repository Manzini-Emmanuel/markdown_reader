# Markdown Reader — Electron App

A VS Code-inspired standalone markdown editor with live preview, file explorer, outline sidebar, and multi-tab support.

## Project structure

```
markdown-reader/
├── main.js       ← Electron main process + IPC handlers
├── preload.js    ← Secure bridge between main and renderer
├── index.html    ← Full app UI
├── package.json  ← Dependencies and build config
└── README.md
```

## Setup

**Prerequisites:** Node.js installed — https://nodejs.org

```bash
# 1. Install dependencies
npm install

# 2. Run in development
npm start
```

## Build a distributable

```bash
# macOS  → dist/Markdown Reader.dmg
npm run build:mac

# Windows → dist/Markdown Reader Setup.exe
npm run build:win

# Linux   → dist/Markdown Reader.AppImage
npm run build:linux
```

Output lands in the `dist/` folder.

## Features

- **File Explorer sidebar** — open any folder and browse its full tree; click any `.md`, `.txt`, or `.markdown` file to open it
- **Multi-tab editor** — open multiple files simultaneously, switch between them, close individually
- **Outline sidebar** — live heading tree with scroll-sync highlighting and filter; click to jump to any section
- **Activity bar** — VS Code-style icon strip to toggle between Explorer and Outline panels
- **Split / Edit / Preview modes** — keyboard-shortcut accessible
- **Save** — Ctrl/Cmd+S writes back to the original file on disk
- **Export as HTML** — exports the rendered preview as a self-contained HTML file
- **Native menus** — File > Open Folder, Open File, Save, Export; View menu for all panel and mode toggles

## Keyboard shortcuts

| Action                  | Shortcut              |
|-------------------------|-----------------------|
| Open Folder             | Ctrl/Cmd + Shift + O  |
| Open File               | Ctrl/Cmd + O          |
| Save                    | Ctrl/Cmd + S          |
| Export as HTML          | Ctrl/Cmd + E          |
| Split view              | Ctrl/Cmd + 1          |
| Editor only             | Ctrl/Cmd + 2          |
| Preview only            | Ctrl/Cmd + 3          |
| Toggle File Explorer    | Ctrl/Cmd + Shift + E  |
| Toggle Outline Sidebar  | Ctrl/Cmd + \          |
| Zoom in / out / reset   | Ctrl/Cmd + + / - / 0  |
| Toggle fullscreen       | F11 (Win/Linux)       |
| DevTools                | Ctrl/Cmd + Shift + I  |

## Adding a custom icon

1. Create an `assets/` folder
2. Add `icon.png` (512×512) for Linux/Windows and `icon.icns` for macOS
3. Uncomment the `icon` line in `main.js`
4. Add `"assets/"` to the `files` array in `package.json`
