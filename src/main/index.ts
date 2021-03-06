import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { UpdateService } from './UpdateService';
import { isDevelopment } from 'common/IsDevelopment';

// If set to true, it'll load the integrated devtools.
// IMPORTANT NOTE: If debugging with VSCode (or any other remote debugging tool), you cannot also debug with the devtools because remote debugging is not supported with multiple devtool!
const showDevTools = false;

// global reference to mainWindow (not neccessary because makeRendererWindow(..) creates a reference aswell)
let mainWindow: BrowserWindow | null;

// This functions does not need to be async by default. It's async because of the installation of the react devtools.
async function createMainWindow() {
    const browserWindow = new BrowserWindow({
        width: 980,
        height: 650
    });

    if (isDevelopment || showDevTools) {
        await installExtension(REACT_DEVELOPER_TOOLS);

        if (showDevTools) {
            browserWindow.webContents.openDevTools();
        }
    }

    // The path to the html file changes depending it it's in development or in production.
    if (isDevelopment) {
        browserWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);

    } else {
        browserWindow.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }));
    }

    browserWindow.on('closed', () => {
        mainWindow = null;
    });

    browserWindow.webContents.on('devtools-opened', () => {
        browserWindow.focus();
        setImmediate(() => {
            browserWindow.focus();
        });
    });

    UpdateService.init();

    return browserWindow;
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