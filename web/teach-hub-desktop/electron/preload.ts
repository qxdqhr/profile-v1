import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('teachHubDesktop', {
  platform: process.platform,
});
