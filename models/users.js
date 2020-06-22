require('./common');
const { ipcRenderer } = require('electron');
const AD = require('ad');
const fs = require('fs');

const buttonUsersGet = document.querySelector('#button-users-get');

buttonUsersGet.onclick = () => {
    const username = document.querySelector('#user-get-username').value;
    const user = username === '' ? undefined : username;

    /*const receiveUsername = document.querySelector('#user-get-check-username').checked;
    const receiveMail = document.querySelector('#user-get-check-mail').checked;
    const receiveDisplayName = document.querySelector('#user-get-check-display-name').checked;
    const receiveGroups = document.querySelector('#user-get-check-groups').checked;

    let options = {};
    options.fields = [];
    receiveUsername === true ? options.fields.push('sAMAccountName') : null;
    receiveMail === true ? options.fields.push('mail') : null;
    receiveDisplayName === true ? options.fields.push('displayName') : null;
    receiveGroups === true ? options.fields.push('groups') : null;*/

    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);

    try {
        ad.user(user).get(optionsForUserGet())
            .then(users => {
                const result = {
                    data: users,
                    fileName: 'get-users.txt'
                };
                ipcRenderer.send('save-data-as', result);
            })
            .catch((error) => {
                ipcRenderer.send('open-error-dialog', 'get error', error.message);
            });
    } catch(e) {
        console.log(e.message);
    }
};

function optionsForUserGet() {
    const receiveUsername = document.querySelector('#user-get-check-username').checked;
    const receiveMail = document.querySelector('#user-get-check-mail').checked;
    const receiveDisplayName = document.querySelector('#user-get-check-display-name').checked;
    const receiveGroups = document.querySelector('#user-get-check-groups').checked;

    let options = {};
    options.fields = [];
    receiveUsername === true ? options.fields.push('sAMAccountName') : null;
    receiveMail === true ? options.fields.push('mail') : null;
    receiveDisplayName === true ? options.fields.push('displayName') : null;
    receiveGroups === true ? options.fields.push('groups') : null;
    return options;
}
