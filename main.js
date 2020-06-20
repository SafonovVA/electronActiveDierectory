const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');
const store = new (require('electron-store'))();
const constants = require('./appConfig');

store.set('value', 'am a constant');

function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 600,
        height: 525,
        icon: path.join(constants.imgDir, 'icon.png'),
        webPreferences: {
            nodeIntegration: true
        }
    });

  win.loadFile(path.join(constants.viewsDir, 'login.html'));

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
