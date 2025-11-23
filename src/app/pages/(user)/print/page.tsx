"use client";

import { usePrintAgent } from "./print";

export default function Page() {
    const { connected, printers, getPrinters, print } = usePrintAgent();

    return (
        <div>
            <h2>Status: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</h2>

            <button onClick={getPrinters}>Listar Impressoras</button>

            <ul>
                {printers.map((p) => (
                    <li key={p}>{p}</li>
                ))}
            </ul>

            <button
                onClick={() =>
                    print({ text: "Teste de impressão via WebSocket!!!" })
                }
            >
                Imprimir teste
            </button>
        </div>
    );
}
