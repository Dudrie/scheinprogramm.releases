import { app, BrowserWindow, MenuItem, MenuItemConstructorOptions } from 'electron';
import { enableLiveReload } from 'electron-compile';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import EventNames from './helpers/EventNames';
import Language from './helpers/Language';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

// From the repo 'electron-is-dev'
// Q: https://github.com/sindresorhus/electron-is-dev
const isDevMode = (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));

if (isDevMode) {
    enableLiveReload({ strategy: 'react-hmr' });
}

const createWindow = async () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 650,
        show: false
    });

    // let menuTemplate: MenuItemConstructorOptions[] = [
    //     {
    //         label: Language.getString('MENU_EDIT'),
    //         submenu: [
    //             {
    //                 label: Language.getString('MENU_EDIT_CREATE_LECTURE'),
    //                 click: (_: MenuItem, window: BrowserWindow) => window.webContents.send(EventNames.M_EV_CREATE_LECTURE),
    //                 accelerator: 'CmdOrCtrl+Shift+N'
    //             },
    //             {
    //                 label: Language.getString('MENU_EDIT_EDIT_LECTURE')
    //             },
    //             {
    //                 type: 'separator'
    //             }
    //         ]
    //     }
    // ];

    // and load the index.html of the app.
    // mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.loadFile('src/index.html');

    // Open the DevTools & add debugging menu stuff
    if (isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();

        // menuTemplate.push(
        //     {
        //         label: 'DEBUG',
        //         submenu: [
        //             { role: 'reload' },
        //             { role: 'forcereload' },
        //             { role: 'toggledevtools' },
        //             { type: 'separator' },
        //             { role: 'resetzoom' },
        //             { role: 'zoomin' },
        //             { role: 'zoomout' },
        //             { type: 'separator' },
        //             { role: 'togglefullscreen' }
        //         ]
        //     }
        // );
    }

    // mainWindow.setMenu(Menu.buildFromTemplate(menuTemplate));

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Emitted when something goes wrong at the start
    mainWindow.webContents.on('did-fail-load', () => {
        if (mainWindow) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
