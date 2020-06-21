require('./common');
const { ipcRenderer } = require('electron');
const AD = require('ad');
const fs = require('fs');

const buttonUsersGet = document.querySelector('#button-users-get');

buttonUsersGet.onclick = () => {
    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);
    ad.user().get()
        .then(users => {
            //const pathToDesktop = ipcRenderer.sendSync('give-path-to-desktop');
            const result = {
                //data: users,
                data: [1, 2 ,3],
                fileName: 'get-users.xlsx'
            };
            ipcRenderer.send('save-data-as', result);
        })
        .catch((error) => {
            ipcRenderer.send('open-error-dialog', 'get errror', error.message);
        });
};

