const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let goProcess = null;
let nextDev = null;

const goBackendPath = path.join(__dirname, '../backend');
const goBinary = path.join(goBackendPath, 'server');
const nextPath = path.join(__dirname, '../src');

let detectedPort = 3000; // Porta padrão inicial

async function createWindow(port) {
    console.log('Criando janela Electron na porta', port);
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        darkTheme: true,
        fullscreen: true,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL(`http://localhost:${port}/login`);

    // win.webContents.openDevTools({ mode: 'undocked' });
    win.webContents.on('did-fail-load', () => {
        console.error('Falha ao carregar a URL:', `http://localhost:${port}/login`);
    });

    win.on('closed', () => {
        console.log('Janela fechada');
    });
}

async function waitForFrontendAndCreateWindow(port) {
    try {
        console.log(`Esperando frontend subir em http://localhost:${port}/login ...`);
        await waitOn({
            resources: [`http://localhost:${port}/login`],
            timeout: 20000, // 20s
            interval: 500,
        });
        console.log('Frontend disponível. Criando janela...');
        createWindow(port);
    } catch (err) {
        console.error('Erro ao esperar frontend subir:', err);
    }
}

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

app.whenReady().then(() => {
    // Inicia backend Go
    goProcess = spawn(goBinary, ['httpserver'], {
        cwd: goBackendPath,
        shell: true,
    });

    goProcess.stdout.on('data', (data) => {
        console.log(`Go: ${data.toString()}`);
    });

    goProcess.stderr.on('data', (data) => {
        console.error(`Go Error: ${data.toString()}`);
    });

    goProcess.on('error', (err) => {
        console.error('Erro ao iniciar Go backend:', err);
    });

    // Inicia Next.js dev
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    nextDev = spawn(npmCmd, ['run', 'start'], {
        cwd: nextPath,
        shell: true,
    });

    nextDev.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Next.js: ${output}`);

        // Detecta porta no log, ex: "Local: http://localhost:3002"
        const match = output.match(/Local:\s*http:\/\/localhost:(\d+)/);
        if (match) {
            const port = parseInt(match[1], 10);
            if (port !== detectedPort) {
                detectedPort = port;
                console.log(`Porta do Next.js detectada: ${detectedPort}`);
            }
        }
    });

    nextDev.stderr.on('data', (data) => {
        console.error(`Next.js Error: ${data.toString()}`);
    });

    nextDev.on('error', (err) => {
        console.error('Erro ao iniciar Next.js frontend:', err);
    });

    // Espera o frontend estar disponível na porta detectada
    waitForFrontendAndCreateWindow(detectedPort);
});

// Limpa processos ao sair
app.on('before-quit', () => {
    if (goProcess) goProcess.kill();
    if (nextDev) nextDev.kill();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})