/**
 * Serviço centralizado de impressão via WebSocket (Print Agent)
 * Substitui o uso do Electron para impressão
 */

interface PrintResponse {
    status: string;
    data?: string[];
    message?: string;
}

interface Request {
    action: string;
    data?: any;
}

class PrintService {
    private ws: WebSocket | null = null;
    private connectPromise: Promise<void> | null = null;
    private printersCache: string[] = [];
    private printersCallbacks: Set<(printers: string[]) => void> = new Set();
    private printResolve: ((value: void) => void) | null = null;
    private printReject: ((error: Error) => void) | null = null;
    private isConnected = false;
    private reconnectTimer = 1000;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Conecta ao Print Agent via WebSocket
     * Público para permitir inicialização externa
     */
    async connect(): Promise<void> {
        if (this.connectPromise) {
            return this.connectPromise;
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket("ws://localhost:8089/ws");

                this.ws.onopen = () => {
                    this.isConnected = true;
                    this.reconnectTimer = 1000;
                    console.log("🟢 Print Agent conectado");
                    resolve();
                    this.connectPromise = null;
                };

                this.ws.onclose = (event) => {
                    this.isConnected = false;
                    
                    // Código 1006 indica conexão fechada anormalmente (geralmente servidor não está rodando)
                    if (event.code === 1006) {
                        console.error("🔴 Conexão fechada anormalmente (código 1006). O Print Agent está rodando em localhost:8089?");
                    } else {
                        console.log("🔴 Print Agent desconectado, reconectando...");
                    }
                    
                    this.connectPromise = null;
                    this.scheduleReconnect();
                };

                this.ws.onerror = (error) => {
                    this.isConnected = false;
                    
                    // O objeto error não tem informações úteis, então verificamos o estado do WebSocket
                    const readyState = this.ws?.readyState;
                    let errorMessage = "Erro ao conectar com o Print Agent";
                    
                    if (readyState === WebSocket.CONNECTING) {
                        errorMessage = "Não foi possível conectar ao Print Agent em ws://localhost:8089/ws. Verifique se o serviço está rodando.";
                        console.error("❌ Erro ao conectar:", errorMessage);
                    } else if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
                        errorMessage = "Conexão com Print Agent foi fechada.";
                        console.error("❌ Conexão fechada:", errorMessage);
                    } else {
                        console.error("❌ Erro no WebSocket (readyState:", readyState, ")");
                    }
                    
                    this.connectPromise = null;
                    reject(new Error(errorMessage));
                };

                this.ws.onmessage = (ev) => {
                    try {
                        const res: PrintResponse = JSON.parse(ev.data);
                        
                        if (res.status === "ok" && Array.isArray(res.data)) {
                            // Resposta de get_printers
                            this.printersCache = res.data;
                            // Garantir tipagem: res.data é string[]
                            this.printersCallbacks.forEach(cb => cb(res.data as string[]));
                            this.printersCallbacks.clear();
                            console.log("📄 Impressoras atualizadas:", (res.data as string[]).length);
                        } else if (res.status === "ok") {
                            // Resposta de print ou outra ação bem-sucedida
                            if (this.printResolve) {
                                this.printResolve();
                                this.printResolve = null;
                                this.printReject = null;
                            }
                            if (res.message) {
                                console.log("✅", res.message);
                            }
                        } else if (res.status === "error") {
                            // Erro do servidor
                            const errorMsg = res.message || "Erro desconhecido";
                            console.error("❌ Erro do servidor:", errorMsg);
                            if (this.printReject) {
                                this.printReject(new Error(errorMsg));
                                this.printResolve = null;
                                this.printReject = null;
                            } else {
                                // Se não há callback de print, pode ser erro de get_printers
                                this.printersCallbacks.forEach(cb => cb([]));
                                this.printersCallbacks.clear();
                            }
                        }
                    } catch (e) {
                        console.error("❌ Erro ao parsear resposta:", e);
                        if (this.printReject) {
                            this.printReject(new Error("Erro ao processar resposta do servidor"));
                            this.printResolve = null;
                            this.printReject = null;
                        }
                    }
                };
            } catch (e) {
                console.error("❌ Erro ao criar WebSocket:", e);
                this.connectPromise = null;
                reject(e);
            }
        });

        return this.connectPromise;
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.reconnectTimeout = setTimeout(() => {
            this.connect().catch(console.error);
        }, this.reconnectTimer);
        this.reconnectTimer = Math.min(30000, this.reconnectTimer * 2);
    }

    /**
     * Aguarda conexão estar pronta
     */
    private async waitForConnection(timeout = 5000): Promise<boolean> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return true;
        }

        try {
            await Promise.race([
                this.connect(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Timeout")), timeout)
                )
            ]);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Envia mensagem via WebSocket
     */
    private async sendMessage(request: Request): Promise<void> {
        if (!(await this.waitForConnection())) {
            throw new Error("Print Agent não está conectado. Verifique se o serviço está rodando em localhost:8089");
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(request));
        } else {
            throw new Error("WebSocket não está conectado");
        }
    }

    /**
     * Retorna lista de impressoras disponíveis
     * Compatível com a interface do Electron API
     */
    async getPrinters(): Promise<Array<{ name: string; description?: string; status?: number; isDefault?: boolean }>> {
        // Se já temos cache e estamos conectados, retorna imediatamente
        if (this.printersCache.length > 0 && this.isConnected) {
            return this.printersCache.map(name => ({ name }));
        }

        // Aguarda resposta (com timeout)
        return new Promise((resolve, reject) => {
            // Registra callback ANTES de enviar mensagem para evitar race condition
            const callback = (printers: string[]) => {
                clearTimeout(timeout);
                this.printersCallbacks.delete(callback);
                resolve(printers.map(name => ({ name })));
            };

            this.printersCallbacks.add(callback);

            const timeout = setTimeout(() => {
                this.printersCallbacks.delete(callback);
                if (this.printersCache.length > 0) {
                    resolve(this.printersCache.map(name => ({ name })));
                } else {
                    reject(new Error("Timeout ao buscar impressoras"));
                }
            }, 3000);

            // Agora envia a mensagem
            this.sendMessage({ action: "get_printers" }).catch((err) => {
                clearTimeout(timeout);
                this.printersCallbacks.delete(callback);
                reject(err);
            });
        });
    }

    /**
     * Imprime texto na impressora especificada
     * Compatível com a interface do Electron API
     */
    async print(text: string, printerName?: string): Promise<void> {
        const printer = printerName || "default";
        
        return new Promise((resolve, reject) => {
            // Limpa callbacks anteriores se houver
            if (this.printResolve || this.printReject) {
                this.printResolve = null;
                this.printReject = null;
            }

            // Timeout para evitar espera infinita
            const timeout = setTimeout(() => {
                if (this.printResolve === resolve) {
                    this.printResolve = null;
                    this.printReject = null;
                }
                reject(new Error("Timeout ao aguardar confirmação de impressão"));
            }, 10000); // 10 segundos

            this.printResolve = () => {
                clearTimeout(timeout);
                resolve();
            };
            this.printReject = (error: Error) => {
                clearTimeout(timeout);
                reject(error);
            };

            // Envia mensagem
            this.sendMessage({
                action: "print",
                data: { printer, text }
            }).catch((error) => {
                clearTimeout(timeout);
                this.printResolve = null;
                this.printReject = null;
                reject(error);
            });
        });
    }

    /**
     * Verifica se o serviço está conectado
     */
    get connected(): boolean {
        return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Desconecta o WebSocket
     */
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.connectPromise = null;
    }
}

// Singleton instance
const printService = new PrintService();

// Conecta automaticamente ao carregar o módulo (apenas no browser)
if (typeof window !== 'undefined') {
    printService.connect().catch(console.error);
}

export default printService;

