const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // File system
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  saveFile: (filePath, content) => ipcRenderer.invoke('fs:saveFile', filePath, content),

  // Dialogs (triggered from renderer)
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveDialog: (defaultName) => ipcRenderer.invoke('dialog:save', defaultName),

  // Menu events (main -> renderer)
  onMenuOpenFile: (cb) => ipcRenderer.on('menu:openFile', (_e, content, filePath) => cb(content, filePath)),
  onMenuExport: (cb) => ipcRenderer.on('menu:export', () => cb()),
  onMenuSetMode: (cb) => ipcRenderer.on('menu:setMode', (_e, mode) => cb(mode)),
  onMenuToggleOutline: (cb) => ipcRenderer.on('menu:toggleOutline', () => cb()),
  onMenuToggleFiles: (cb) => ipcRenderer.on('menu:toggleFiles', () => cb()),
  onMenuSave: (cb) => ipcRenderer.on('menu:save', () => cb()),
})
