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

/*async function writeFile(data, fileFormat, usersPath) {
    switch (fileFormat) {
        case 'txt':
            let text = '';
            data.forEach(user => {
                Object.keys(user).forEach(key => {
                    text += user[key] + '\t';
                });
                text += '\n';
            });

            fs.writeFile(usersPath, text, err => {
                if (err) {
                    throw err;
                }
                console.log('Success');
            });
            break;
        case 'json':
            fs.writeFile(usersPath, JSON.stringify(data, null, 4)
                                        .replace(/sAMAccountName/gim, 'username')
                                        .replace(/displayName/gim, 'display name'), err => {
                if (err) {
                    throw err;
                }
                console.log('Success');
            });
            break;
        case 'xlsx':
            try {
                const excel = require('exceljs');
                const workbook = new excel.Workbook();
                const sheet = workbook.addWorksheet('User get');

                const columns = [];
                for (let property in data[0]) {
                    if (data[0].hasOwnProperty(property)) {
                        columns.push({header: excelHeaders[property] || property, key: property, width: 10});
                    }
                }
                sheet.columns = columns;
                sheet.columns.forEach(column => {
                    column.width = column.header.length < 15 ? 15 : column.header.length;
                });
                //sheet.getRow(1).font = {
                //    bold: true
                //};

                for (let user of data) {
                    sheet.addRow(user);
                }

                for (let i = 1; i <= sheet.columns.length; i++) {
                    const cell = sheet.getRow(1).getCell(i);
                    cell.border = {
                        bottom: {style: 'double', color: {argb: '#020202'}}
                    };
                    cell.font = {
                        bold: true
                    };
                }

                await workbook.xlsx.writeFile(usersPath);
                console.log('Success');
            } catch (error) {
                switch (error.code) {
                    case 'EBUSY':
                        dialog.showErrorBox('Excel save error', 'File busy or locked');
                        break;
                    default:
                        console.log(JSON.stringify(error, null, 4) + '\n' + error.message);
                }
                console.log(JSON.stringify(error, null, 4));
            }
    }
}*/

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
