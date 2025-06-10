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
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL(`http://localhost:${port}/login`);

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

// IPC handler para imprimir pedidos via processo principal
ipcMain.handle('printer', async (_event, { html, options, printerName }) => {
    const printWin = new BrowserWindow({ show: false });
    await printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise((resolve) => printWin.webContents.once('did-finish-load', resolve));
    const printOptions = { ...options };
    if (printerName) printOptions.deviceName = printerName;
    printWin.webContents.print(printOptions, (success, failureReason) => {
        if (!success) console.error('Falha ao imprimir:', failureReason);
        printWin.close();
    });
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

    nextDev = spawn(npmCmd, ['run', 'dev'], {
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