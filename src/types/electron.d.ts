declare global {
  interface Window {
    electronAPI?: {
      /** Retorna lista de impressoras disponíveis */
      getPrinters(): Promise<Array<{ name: string; description?: string; status?: number; isDefault?: boolean }>>;
      /** Imprime o HTML na impressora especificada (ou padrão se printerName for undefined) */
      printer(html: string, printerName?: string, options?: { silent?: boolean; printBackground?: boolean }): Promise<void>;
      /** Retorna credenciais salvas (ou null) */
      getCredentials(): Promise<{ email: string; password: string } | null>;
      /** Salva credenciais de login */
      saveCredentials(email: string, password: string): Promise<boolean>;
      /** Limpa credenciais salvas */
      clearCredentials(): Promise<boolean>;
    };
  }
}

export {};