const { app, BrowserWindow, ipcMain } = require('electron');
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

// IPC handler para imprimir pedidos via processo principal
ipcMain.handle('printer', async (_event, { html, options }) => {
    const printWin = new BrowserWindow({ show: false });
    await printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise((resolve) => printWin.webContents.once('did-finish-load', resolve));
    printWin.webContents.print(options);
    printWin.close();
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