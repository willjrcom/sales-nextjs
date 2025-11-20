const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const next = require("next");
const http = require("http");

const dev = process.env.NODE_ENV !== "production";

// Inicializa o Next.js apontando para a raiz do projeto (um nível acima da pasta `electron`)
const nextApp = next({ dev, dir: path.join(__dirname, "..") });
const handle = nextApp.getRequestHandler();

let mainWindow;

async function createWindow() {
    // Prepara o Next.js
    await nextApp.prepare();

    // Cria o servidor interno do Next.js
    const server = http.createServer((req, res) => {
        handle(req, res);
    });

    const PORT = 3000;
    server.listen(PORT);

    // Cria a janela do Electron
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Quando a janela carregar, mostra ela
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.loadURL(`http://localhost:${PORT}/login`);
}

// Use whenReady().then(...) e trate erros para evitar UnhandledPromiseRejection
app.whenReady().then(createWindow).catch((err) => {
    console.error("Falha ao criar a janela do Electron:", err);
    // Encerrar o app em caso de falha na inicialização do Next
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});



// IPC handler para obter lista de impressoras disponíveis
// IPC handler para obter lista de impressoras disponíveis
ipcMain.handle('get-printers', async (_event) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return [];
    const wc = win.webContents;
    if (typeof wc.getPrinters === 'function') {
        return wc.getPrinters();
    }
    if (typeof wc.getPrintersAsync === 'function') {
        return await wc.getPrintersAsync();
    }
    return [];
});

// IPC handler para imprimir ESC/POS raw em múltiplas plataformas
ipcMain.handle('printer', async (_event, { html, printerName }) => {
    console.log('Iniciando impressão raw. Impressora:', printerName, 'Plataforma:', process.platform);
    if (!printerName) {
        return { success: false, error: 'Nenhuma impressora selecionada' };
    }
    const dataBuffer = Buffer.from(html, 'binary');
    // macOS / Linux: usar CUPS via lp
    if (process.platform === 'darwin' || process.platform === 'linux') {
        return await new Promise((resolve) => {
            const lp = spawn('lp', ['-d', printerName, '-o', 'raw']);
            let stderr = '';
            lp.stdin.write(dataBuffer);
            lp.stdin.end();
            lp.stderr.on('data', chunk => { stderr += chunk.toString(); });
            lp.on('close', code => {
                if (code === 0) {
                    console.log('lp -> impressora OK');
                    resolve({ success: true });
                } else {
                    console.error('lp -> erro code', code, stderr);
                    resolve({ success: false, error: stderr || `lp exit code ${code}` });
                }
            });
        });
    }
    // Windows: usar comando print (envia arquivo temporário)
    if (process.platform === 'win32') {
        try {
            const os = require('os');
            const tmpPath = path.join(os.tmpdir(), `receipt_${Date.now()}.bin`);
            fs.writeFileSync(tmpPath, dataBuffer);
            return await new Promise((resolve) => {
                const pr = spawn('cmd.exe', ['/c', 'print', `/D:${printerName}`, tmpPath]);
                let stderr = '';
                pr.stderr.on('data', chunk => { stderr += chunk.toString(); });
                pr.on('close', code => {
                    fs.unlinkSync(tmpPath);
                    if (code === 0) {
                        console.log('print -> impressora OK');
                        resolve({ success: true });
                    } else {
                        console.error('print -> erro code', code, stderr);
                        resolve({ success: false, error: stderr || `print exit code ${code}` });
                    }
                });
            });
        } catch (err) {
            console.error('Erro imprimindo no Windows:', err);
            return { success: false, error: err.message || String(err) };
        }
    }
    // plataforma não suportada
    return { success: false, error: `Plataforma ${process.platform} não suportada para impressão raw` };
});

// IPC handlers para lembrar credenciais de login
const credsFile = path.join(app.getPath('userData'), 'credentials.json');
ipcMain.handle('get-credentials', () => {
    try {
        const data = fs.readFileSync(credsFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return null;
    }
});
ipcMain.handle('save-credentials', (_event, { email, password }) => {
    try {
        fs.writeFileSync(credsFile, JSON.stringify({ email, password }), 'utf8');
        return true;
    } catch (err) {
        console.error('Erro ao salvar credenciais:', err);
        return false;
    }
});
ipcMain.handle('clear-credentials', () => {
    try {
        fs.unlinkSync(credsFile);
        return true;
    } catch {
        return false;
    }
});
