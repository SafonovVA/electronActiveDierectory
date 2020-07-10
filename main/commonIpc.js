const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const constants = require('../appConfig');

let loginWindow;
function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 440,
        height: 280,
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
    event.reply('hide-animation-in-button');
});
ipcMain.on('open-info-dialog', (event, ...message) => {
    dialog.showMessageBox({
        type: 'info',
        buttons: ['Ok'],
        title: message[0],
        message: message[1],
    });
    event.reply('hide-animation-in-button');
});

ipcMain.on('give-ad-config', event => event.returnValue = adConfig);

ipcMain.on('give-path-to-desktop', event => event.returnValue = app.getPath('desktop'));

ipcMain.on('save-data-as', async (event, {result, fileFormat}) => {

    const usersPath = dialog.showSaveDialogSync(null, {
        title: 'Get user data',
        defaultPath: path.join(app.getPath('desktop'), result.fileName),
        filters: {// ?
            name: result.fileName,// ?
            extensions: fileFormat// ?
        }// ?
    });
    if (usersPath === undefined) {
        event.reply('hide-animation-in-button');
        return false;
    }
    const {writeFile} = require('../libs/fileSaver');
    await writeFile(result.data, fileFormat, usersPath);
    event.reply('hide-animation-in-button');
});

ipcMain.on('authentication-success', (event) => {
    console.log('Authentication success');
    createMainWindow();
    loginWindow.close();
    event.returnValue = 0;
});

function createMainWindow() {
    const usersWindow = new BrowserWindow({
        width: 1000,//440
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

