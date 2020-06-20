const { ipcRenderer } = require('electron');
const ActiveDirectory = require('activedirectory');
const constants = require('../appConfig.js');
const store = new (require('electron-store'))();

let submit = document.querySelector('#login-submit');

submit.onclick = () => {
    const loginUrl = document.querySelector('#login-url');
    const loginBaseDN = document.querySelector('#login-basedn');
    const loginUsername = document.querySelector('#login-username');
    const loginPassword = document.querySelector('#login-password');
    const loginRow = document.querySelector('#login-row');

    if (loginUsername.value === '') {
        ipcRenderer.send('open-error-dialog', 'Username error', 'Username is required');
        return false;
    } else if (loginPassword.value === '') {
        ipcRenderer.send('open-error-dialog', 'Password error', 'Password is required');
        return false;
    }

    store.set('loginUrl', loginUrl.value);
    store.set('loginBaseDN', loginBaseDN.value);
    store.set('loginUsername', loginUsername.value + constants.postfix);

    const config = {
        url: loginUrl.value,
        baseDN: loginBaseDN.value,
        password: loginPassword.value,
        username: loginUsername.value + constants.postfix,
        tlsOptions: {
            requestCert: true,
            rejectUnauthorized: false,
        }
    };

    const ad = new ActiveDirectory(config);

    ad.authenticate(config.username, config.password, function (err, auth) {
        if (auth === true) {
            ipcRenderer.send('create-ad-config', config);
            ipcRenderer.sendSync('authentication-success');
        } else {
            ipcRenderer.send('open-error-dialog', 'Login error', 'Authentication failed');
            loginPassword.value = '';
            console.log(JSON.stringify(err, null, 4));
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const url = document.querySelector('#login-url');
    const basedn = document.querySelector('#login-basedn');
    const user = document.querySelector('#login-username');
    const password = document.querySelector('#login-password');

    url.value = constants.url || store.get('loginUrl') || '';
    basedn.value = constants.baseDN || store.get('loginBaseDN') || '';
    user.value = constants.username || store.get('loginUsername') || '';
    password.value = constants.password || '';
});

function showCredentialsErrorMessage(element, credential) {
    element.insertAdjacentHTML('afterend', `<div id="login-error" class="alert alert-danger"><span>${credential} is required</span></div>`);
    setTimeout(() => document.querySelector('#login-error').hidden = true, 3000);
}

function showAuthErrorMessage(element) {
    element.insertAdjacentHTML('afterend', '<div id="login-error" class="alert alert-danger"><span>Authentication failed</span></div>');
    setTimeout(() => document.querySelector('#login-error').hidden = true, 3000);
}
