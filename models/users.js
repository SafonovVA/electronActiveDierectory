require('./common');
const {ipcRenderer} = require('electron');
const AD = require('ad');
const fs = require('fs');
const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

const buttonUsersGet = document.querySelector('#button-users-get');

buttonUsersGet.onclick = async () => {
    buttonUsersGet.insertAdjacentHTML('afterbegin', spinner);
    const username = document.querySelector('#user-get-username').value;
    const user = username !== '' ? username : undefined;

    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);
    const {queryOptions, fileFormat} = optionsForUserGet();
    console.log(fileFormat)
    if (queryOptions === false) {
        return false;
    }
    try {
        const users = await ad.user(user).get(queryOptions);
        if (Object.keys(users).length || users.length) {
            console.log(Object.keys(users).length);
            console.log(users.length);


            if (Array.isArray(users)) {
                users.map(user => {
                    if (user.hasOwnProperty('groups')) {
                        user.groups = convertUserGroupsToString(user)
                    }
                });
            } else {
                //console.log('not array' + user)
                if (users.hasOwnProperty('groups')) {
                    users.groups = convertUserGroupsToString(users);
                }
            }


            const result = {
                data: users,
                fileName: `get-users.${fileFormat}`
            };
            ipcRenderer.send('save-data-as', {result, fileFormat});
        } else {
            ipcRenderer.send('open-info-dialog', 'User get info', 'Users not found');
        }
        ipcRenderer.on('hide-animation-in-button', hideAnimationButton);
    } catch (error) {
        ipcRenderer.send('open-error-dialog', 'get error', error.message);
        ipcRenderer.on('hide-animation-in-button', hideAnimationButton);
        return false;
    }
};

function convertUserGroupsToString(user) {
    return (user.groups.map(group => group.cn)).join('; ');
}

function hideAnimationButton() {
    if (buttonUsersGet.querySelector('[role="status"]')) {
        buttonUsersGet.querySelector('[role="status"]').remove();
    }
}

function optionsForUserGet() {
    const queryOptions = {};

    const receiveUsername = document.querySelector('#user-get-fields-username').checked;
    const receiveMail = document.querySelector('#user-get-fields-mail').checked;
    const receiveDisplayName = document.querySelector('#user-get-fields-display-name').checked;
    const receiveGroups = document.querySelector('#user-get-fields-groups').checked;
    const checkingArray = [receiveUsername, receiveMail, receiveDisplayName, receiveGroups].filter(Boolean);
    if (checkingArray.length === 0) {
        ipcRenderer.send('open-error-dialog', 'Field error', 'This query must contains at least one field');
        return false;
    }

    queryOptions.fields = [];
    receiveUsername === true ? queryOptions.fields.push('sAMAccountName') : null;
    receiveMail === true ? queryOptions.fields.push('mail') : null;
    receiveDisplayName === true ? queryOptions.fields.push('displayName') : null;
    receiveGroups === true ? queryOptions.fields.push('groups') : null;

    const orderUsername = document.querySelector('#user-get-order-username').checked;
    const orderMail = document.querySelector('#user-get-order-mail').checked;
    const orderDisplayName = document.querySelector('#user-get-order-display-name').checked;

    queryOptions.order = [[
        {name: 'sAMAccountName', value: orderUsername},
        {name: 'mail', value: orderMail},
        {name: 'displayName', value: orderDisplayName},
    ].filter(item => item.value === true)[0].name];

    if (document.querySelector('#user-get-username').value !== '') {
        queryOptions.limit = [1];
    } else {
        const userLimit = document.querySelector('#user-get-limit').value;
        if (!userLimit || userLimit < 0) {
            ipcRenderer.send('open-error-dialog', 'Invalid number', 'Invalid user limit number');
            return false;
        } else if (userLimit > 0) {
            queryOptions.limit = [userLimit];
        }
    }

    const fileFormatJson = document.querySelector('#user-get-output-json').checked;
    const fileFormatTxt = document.querySelector('#user-get-output-txt').checked;
    const fileFormatExcel = document.querySelector('#user-get-output-excel').checked;

    const fileFormat = [
        {name: 'json', value: fileFormatJson},
        {name: 'txt', value: fileFormatTxt},
        {name: 'xlsx', value: fileFormatExcel},
    ].filter(item => item.value === true)[0].name;

    return {queryOptions, fileFormat};
}

