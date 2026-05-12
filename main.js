const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 700,
    minHeight: 450,
    title: 'Markdown Reader',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // icon: path.join(__dirname, 'assets', 'icon.png'),
  })

  win.loadFile('index.html')
  buildMenu()
}

// ── IPC: File system ──────────────────────────────────────────────────────────

ipcMain.handle('fs:readFile', (_e, filePath) => {
  return fs.readFileSync(filePath, 'utf-8')
})

ipcMain.handle('fs:saveFile', (_e, filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8')
  return true
})

ipcMain.handle('fs:readDir', (_e, dirPath) => {
  function walk(dir, depth) {
    if (depth > 6) return []
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return [] }
    return entries
      .filter(e => !e.name.startsWith('.'))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1
        if (!a.isDirectory() && b.isDirectory()) return 1
        return a.name.localeCompare(b.name)
      })
      .map(e => {
        const fullPath = path.join(dir, e.name)
        const isDir = e.isDirectory()
        return {
          name: e.name,
          path: fullPath,
          isDir,
          ext: isDir ? null : path.extname(e.name).toLowerCase(),
          children: isDir ? walk(fullPath, depth + 1) : null,
        }
      })
  }
  return { name: path.basename(dirPath), path: dirPath, children: walk(dirPath, 0) }
})

// ── IPC: Dialogs ──────────────────────────────────────────────────────────────

ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  if (canceled || !filePaths.length) return null
  return filePaths[0]
})

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths.length) return null
  const filePath = filePaths[0]
  return { content: fs.readFileSync(filePath, 'utf-8'), filePath }
})

ipcMain.handle('dialog:save', async (_e, defaultName) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: defaultName || 'document.html',
    filters: [{ name: 'HTML', extensions: ['html'] }]
  })
  return canceled ? null : filePath
})

// ── Menu ──────────────────────────────────────────────────────────────────────

function buildMenu() {
  const isMac = process.platform === 'darwin'
  const send = (channel, ...args) => win && win.webContents.send(channel, ...args)

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'services' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder…',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!canceled && filePaths.length) send('menu:openFolder', filePaths[0])
          }
        },
        {
          label: 'Open File…',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
              properties: ['openFile']
            })
            if (!canceled && filePaths.length) {
              const content = fs.readFileSync(filePaths[0], 'utf-8')
              send('menu:openFile', content, filePaths[0])
            }
          }
        },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('menu:save') },
        { label: 'Export as HTML…', accelerator: 'CmdOrCtrl+E', click: () => send('menu:export') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle File Explorer', accelerator: 'CmdOrCtrl+Shift+E', click: () => send('menu:toggleFiles') },
        { label: 'Toggle Outline Sidebar', accelerator: 'CmdOrCtrl+\\', click: () => send('menu:toggleOutline') },
        { type: 'separator' },
        { label: 'Split View',   accelerator: 'CmdOrCtrl+1', click: () => send('menu:setMode', 'split') },
        { label: 'Editor Only',  accelerator: 'CmdOrCtrl+2', click: () => send('menu:setMode', 'editor') },
        { label: 'Preview Only', accelerator: 'CmdOrCtrl+3', click: () => send('menu:setMode', 'preview') },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
