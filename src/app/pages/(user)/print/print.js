import { useEffect, useRef, useState } from "react";

export function usePrintAgent() {
    const ws = useRef(null);
    const [connected, setConnected] = useState(false);
    const [printers, setPrinters] = useState([]);

    useEffect(() => {
        function connect() {
            ws.current = new WebSocket("ws://localhost:8089/ws");

            ws.current.onopen = () => {
                setConnected(true);
                console.log("Conectado ao Print Agent");
            };

            ws.current.onclose = () => {
                setConnected(false);
                console.log("Desconectado. Tentando conectar...");
                setTimeout(connect, 2000);
            };

            ws.current.onerror = () => {
                setConnected(false);
            };

            ws.current.onmessage = (msg) => {
                console.log("Recebido:", msg.data);

                try {
                    const res = JSON.parse(msg.data);

                    if (res.status === "ok" && Array.isArray(res.data)) {
                        setPrinters(res.data);
                    }
                } catch { }
            };
        }

        connect();
    }, []);

    function getPrinters() {
        if (connected) {
            ws.current.send(JSON.stringify({ action: "get_printers" }));
        }
    }

    function print(data) {
        if (connected) {
            ws.current.send(JSON.stringify({ action: "print", data }));
        }
    }

    return { connected, printers, getPrinters, print };
}
