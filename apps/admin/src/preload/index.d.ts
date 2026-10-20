export interface IElectronAPI {
  getVersion: () => Promise<string>
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
