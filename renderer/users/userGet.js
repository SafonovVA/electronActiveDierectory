const {ipcRenderer} = require('electron');
const AD = require('ad');
const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
let userGetCache = new Map();

const buttonUsersGet = document.querySelector('#button-users-get');

buttonUsersGet.onclick = async () => {
    buttonUsersGet.insertAdjacentHTML('afterbegin', spinner);
    let userName = document.querySelector('#user-get-username').value;
    userName = userName !== '' ? userName : undefined;

    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);
    const {queryOptions, fileFormat} = optionsForUserGet();

    const cacheKey = JSON.stringify(Object.assign({userName: userName}, queryOptions));

    if (queryOptions === undefined) {
        hideAnimationButton(buttonUsersGet);
        return false;
    }

    try {
        let users;
        if (userGetCache.has(cacheKey)) {
            users = userGetCache.get(cacheKey);
        } else {
            users = await ad.user(userName).get(queryOptions);
            users = Array.isArray((users)) ? users : [users];
            userGetCache.set(cacheKey, users);
        }

        const nothingNotFound = users.length === 0;
        const userNotFound = Object.keys(users[0]).length === 0;
        if (nothingNotFound || userNotFound) {
            if (nothingNotFound) {
                const message = queryOptions.hasOwnProperty('limit') && queryOptions.limit[0] === 1 ? 'of the user' : 'of users';
                ipcRenderer.send('open-info-dialog', 'User get info', `Attributes (${queryOptions.fields}) ${message} are empty`);
            }
            if (userNotFound) {
                const message = queryOptions.hasOwnProperty('limit') && queryOptions.limit[0] === 1 ? 'User not found' : 'Users not found';
                ipcRenderer.send('open-info-dialog', 'User get info', message);
            }
            ipcRenderer.on('hide-animation-in-button', () => hideAnimationButton(buttonUsersGet));
            return false;
        }

        users.forEach(user => {
            if (user.hasOwnProperty('groups')) {
                user.groups = convertUserGroupsToString(user)
            }
        });

        const result = {
            data: users,
            fileName: `get-users.${fileFormat}`
        };
        ipcRenderer.send('save-data-as', {result, fileFormat});
    } catch (error) {
        ipcRenderer.send('open-error-dialog', 'get error', error.message);
    } finally {
        ipcRenderer.on('hide-animation-in-button', () => hideAnimationButton(buttonUsersGet));
    }
};

function convertUserGroupsToString(user) {
    return (user.groups.map(group => group.cn)).join('; ');
}

function hideAnimationButton(button) {
    if (button.querySelector('[role="status"]')) {
        button.querySelector('[role="status"]').remove();
    }
}

function optionsForUserGet() {
    const queryOptions = {};

    queryOptions.fields = [];
    const checkBoxes = document.querySelectorAll('input[name="user-get-fields"]');
    checkBoxes.forEach(checkBox => checkBox.checked === true && queryOptions.fields.push(checkBox.value));
    if (queryOptions.fields.length === 0) {
        ipcRenderer.send('open-error-dialog', 'Field error', 'This query must contains at least one field');
        ipcRenderer.on('hide-animation-in-button', () => hideAnimationButton(buttonUsersGet));
        return false;
    }

    queryOptions.order = [document.querySelector('input[name="user-get-order"]:checked').value];

    if (document.querySelector('#user-get-username').value !== '') {
        queryOptions.limit = [1];
    } else {
        const userLimit = document.querySelector('#user-get-limit').value;
        if (+userLimit < 0) {
            ipcRenderer.send('open-error-dialog', 'Invalid number', 'Invalid user limit number');
            return false;
        } else if (+userLimit > 0) {
            queryOptions.limit = [userLimit];
        }
    }

    const fileFormat = document.querySelector('input[name="user-get-output"]:checked').value;

    return {queryOptions, fileFormat};
}

