import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as path from 'path';
import { format as formatUrl } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production';

// If set to true, it'll load the integrated devtools.
// IMPORTANT NOTE: If debugging with VSCode (or any other remote debugging tool), you cannot also debug with the devtools because remote debugging is not supported with multiple devtool!
const showDevTools = false;

// global reference to mainWindow (not neccessary because makeRendererWindow(..) creates a reference aswell)
let mainWindow: BrowserWindow | null;

// This functions does not need to be async by default. It's async because of the installation of the react devtools.
async function createMainWindow() {
    const window = new BrowserWindow();

    if (isDevelopment) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        
        if (showDevTools) {
            window.webContents.openDevTools();
        }
    }

    // The path to the html file changes depending it it's in development or in production.
    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
    }

    window.on('closed', () => {
        mainWindow = null;
    });

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    return mainWindow;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        createMainWindow().then((win) => mainWindow = win);
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
    createMainWindow().then((win) => mainWindow = win);
});
