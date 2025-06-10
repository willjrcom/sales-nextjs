const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printer: (html, printerName, options = { silent: false, printBackground: true }) =>
    ipcRenderer.invoke('printer', { html, printerName, options }),
  // Credenciais de login
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  saveCredentials: (email, password) => ipcRenderer.invoke('save-credentials', { email, password }),
  clearCredentials: () => ipcRenderer.invoke('clear-credentials'),
});