const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const url = require('url');
const path = require('path');
const constants = require('./appConfig');

let loginWindow;
function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 800,//440
        height: 600,//225
        resizable: false,
        movable: false,
        center: true,
        backgroundColor: '#222233',
        alwaysOnTop: false,
        icon: path.join(constants.imgResDir, 'icon.png'),
        webPreferences: {
            nodeIntegration: true
        },
    });

    loginWindow.removeMenu();

    loginWindow.loadFile(path.join(constants.viewsDir, 'login.html'));

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
    });

    loginWindow.webContents.openDevTools();
}

app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});

let adConfig;
ipcMain.on('create-ad-config', (event, config) => {
    adConfig = {
        url: config.url,
        baseDN: config.baseDN,
        user: config.username,
        pass: config.password,
        tlsOptions: config.tlsOptions
    };
});

ipcMain.on('open-error-dialog', (event, ...message) => {
    dialog.showErrorBox(message[0], message[1]);
});

ipcMain.on('give-ad-object', (event) => {
    const AD = require('ad');
    const ad = new AD(adConfig);
    event.reply('take-ad-object', ad);
});

ipcMain.on('authentication-success', (event) => {
    console.log('Authentication success');
    createUsersWindow();
    loginWindow.close();
    event.returnValue = 0;
});

function createUsersWindow() {
    const usersWindow = new BrowserWindow({
        width: 800,//440
        height: 600,//225
        icon: path.join(constants.imgResDir, 'icon.png'),
        webPreferences: {
            nodeIntegration: true
        },
    });

    usersWindow.loadFile(path.join(constants.viewsDir, 'users.html'));

    usersWindow.once('ready-to-show', () => {
        usersWindow.show();
    });

    usersWindow.webContents.openDevTools();
}

