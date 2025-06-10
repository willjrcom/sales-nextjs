const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printer: async (html, printerName, options = { silent: false, printBackground: true }) => {
    const result = await ipcRenderer.invoke('printer', { html, printerName, options });
    if (!result || result.success === false) {
      const msg = result && result.error ? result.error : 'Falha desconhecida ao imprimir';
      throw new Error(msg);
    }
    return result;
  },
  // Credenciais de login
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  saveCredentials: (email, password) => ipcRenderer.invoke('save-credentials', { email, password }),
  clearCredentials: () => ipcRenderer.invoke('clear-credentials'),
});