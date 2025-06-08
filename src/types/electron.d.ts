declare global {
  interface Window {
    electronAPI?: {
      printer(html: string, options?: { silent?: boolean; printBackground?: boolean }): Promise<void>;
    };
  }
}

export {};