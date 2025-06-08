const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printer: (html, options = { silent: false, printBackground: true }) =>
    ipcRenderer.invoke('printer', { html, options })
});