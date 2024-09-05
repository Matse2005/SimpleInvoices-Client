import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown, extra: unknown = null) {
    if (extra)
      ipcRenderer.send(channel, value, extra);
    else
      ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, subscription);

    // Return a function to remove the listener
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  once(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.once(channel, subscription);
  },
  printPage: (url: string) => ipcRenderer.send('print-url', url),
};

contextBridge.exposeInMainWorld('ipc', handler)

// contextBridge.exposeInMainWorld('ipc', {
//   send: (channel, data) => ipcRenderer.send(channel, data),
//   on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args)),
//   once: (channel, callback) => ipcRenderer.once(channel, (event, ...args) => callback(event, ...args))
// });

export type IpcHandler = typeof handler
