import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
export const electronAPI = {
  getVersion: (): Promise<string> => ipcRenderer.invoke('app-version'),
  openExternal: (url: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('open-external-url', url)
}

// Expose in isolated context
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Failed to expose electronAPI:', error)
  }
} else {
  // @ts-ignore
  window.electronAPI = electronAPI
}
