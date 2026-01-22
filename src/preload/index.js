const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('focos', {
  blockSites: (sites) => ipcRenderer.invoke('block-sites', sites),
  unblockSites: () => ipcRenderer.invoke('unblock-sites')
});
