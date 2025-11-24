import { useEffect, useRef, useState, useCallback } from "react";

interface PrintData {
    printer: string;
    text: string;
}

interface PrintResponse {
    status: string;
    data?: string[];
    message?: string;
}

export function usePrintAgent() {
    const ws = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [printers, setPrinters] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let reconnectTimer = 1000;

        function connect() {
            try {
                ws.current = new WebSocket("ws://localhost:8089/ws");

                ws.current.onopen = () => {
                    if (!mounted) return;
                    setConnected(true);
                    setError(null);
                    reconnectTimer = 1000;
                    console.log("🟢 Print Agent conectado");
                };

                ws.current.onclose = (event) => {
                    if (!mounted) return;
                    setConnected(false);
                    
                    // Código 1006 indica conexão fechada anormalmente (geralmente servidor não está rodando)
                    if (event.code === 1006) {
                        setError("Print Agent não está rodando. Verifique se o serviço está em localhost:8089");
                        console.error("🔴 Conexão fechada anormalmente (código 1006). O Print Agent está rodando?");
                    } else {
                        console.log("🔴 Print Agent desconectado, reconectando em", reconnectTimer / 1000, "segundos");
                    }
                    
                    setTimeout(() => {
                        if (mounted) connect();
                    }, reconnectTimer);
                    reconnectTimer = Math.min(30000, reconnectTimer * 2);
                };

                ws.current.onerror = (error) => {
                    if (!mounted) return;
                    setConnected(false);
                    
                    // O objeto error não tem informações úteis, então verificamos o estado do WebSocket
                    const readyState = ws.current?.readyState;
                    let errorMessage = "Erro ao conectar com o Print Agent";
                    
                    if (readyState === WebSocket.CONNECTING) {
                        errorMessage = "Não foi possível conectar ao Print Agent em ws://localhost:8089/ws. Verifique se o serviço está rodando.";
                    } else if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
                        errorMessage = "Conexão com Print Agent foi fechada. Tentando reconectar...";
                    }
                    
                    setError(errorMessage);
                    console.error("❌ Erro no WebSocket (readyState:", readyState, "):", errorMessage);
                };

                ws.current.onmessage = (ev) => {
                    try {
                        const res: PrintResponse = JSON.parse(ev.data);
                        
                        if (res.status === "ok" && Array.isArray(res.data)) {
                            setPrinters(res.data);
                            console.log("📄 Impressoras encontradas:", res.data.length);
                        } else if (res.status === "ok" && res.message) {
                            console.log("✅", res.message);
                        } else if (res.status === "error") {
                            setError(res.message || "Erro desconhecido");
                            console.error("❌ Erro do servidor:", res.message);
                        }
                    } catch (e) {
                        console.error("❌ Erro ao parsear resposta:", e);
                    }
                };
            } catch (e) {
                console.error("❌ Erro ao criar WebSocket:", e);
                setError("Não foi possível conectar ao Print Agent");
            }
        }

        connect();

        return () => {
            mounted = false;
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const getPrinters = useCallback(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ action: "get_printers" }));
            console.log("📋 Solicitando lista de impressoras...");
        } else {
            console.warn("⚠️ WebSocket não está conectado");
        }
    }, []);

    const print = useCallback(({ printer, text }: PrintData) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const data = {
                action: "print",
                data: { printer: printer || "default", text }
            };
            ws.current.send(JSON.stringify(data));
            console.log("🖨️ Enviando para impressão:", printer || "padrão");
        } else {
            console.error("❌ WebSocket não está conectado");
            throw new Error("Print Agent não está conectado");
        }
    }, []);

    return { connected, printers, error, getPrinters, print };
}