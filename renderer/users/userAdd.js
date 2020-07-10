require('../common');
const {ipcRenderer} = require('electron');
const AD = require('ad');
const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

const buttonUsersAdd = document.querySelector('#button-user-add');

buttonUsersAdd.onclick = async () => {
    buttonUsersAdd.insertAdjacentHTML('afterbegin', spinner);

    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);
    try {
        const queryOptions = optionsForUserAdd();

        const newUser = await ad.user().add(queryOptions);
        ipcRenderer.send('open-info-dialog', 'User successfully created', JSON.stringify(newUser, null, 4));

    } catch (error) {
        ipcRenderer.send('open-info-dialog', 'User add error', error.message);
    } finally {
        ipcRenderer.on('hide-animation-in-button', () => hideAnimationButton(buttonUsersAdd));
    }


    //const cacheKey = JSON.stringify(Object.assign({userName: userName}, queryOptions));
//
    //if (queryOptions === undefined) {
    //    hideAnimationButton(buttonUsersGet);
    //    return false;
    //}
//
    //try {
    //    let users;
    //    if (userGetCache.has(cacheKey)) {
    //        users = userGetCache.get(cacheKey);
    //    } else {
    //        users = await ad.user(userName).get(queryOptions);
    //        users = Array.isArray((users)) ? users : [users];
    //        userGetCache.set(cacheKey, users);
    //    }
//
    //    if (checkUserGetResult(users, queryOptions) === false) {
    //        return false;
    //    }
//
    //    users.forEach(user => {
    //        if (user.hasOwnProperty('groups')) {
    //            user.groups = convertUserGroupsToString(user)
    //        }
    //    });
//
    //    const result = {
    //        data: users,
    //        fileName: `get-users.${fileFormat}`
    //    };
    //    ipcRenderer.send('save-data-as', {result, fileFormat});
    //} catch (error) {
    //    ipcRenderer.send('open-error-dialog', 'get error', error.message);
    //} finally {
    //    ipcRenderer.on('hide-animation-in-button', () => hideAnimationButton(buttonUsersGet));
    //}
};

function hideAnimationButton(button) {
    if (button.querySelector('[role="status"]')) {
        button.querySelector('[role="status"]').remove();
    }
}

function optionsForUserAdd() {

    const userName = checkNodeIsEmpty(document.querySelector('#user-add-username'));
    const commonName = checkNodeIsEmpty(document.querySelector('#user-add-common-name'));
    const pass = checkNodeIsEmpty(document.querySelector('#user-add-password'));

    const requiredFields = [userName, commonName, pass];
    for (let field of requiredFields) {
        if (!field) {
            throw new Error('Fill all required fields');
        }
    }

    const email = document.querySelector('#user-add-mail').value;
    const firstName = document.querySelector('#user-add-first-name').value;
    const lastName = document.querySelector('#user-add-last-name').value;


    return {userName, commonName, pass, email, firstName, lastName};
}

function checkNodeIsEmpty(node) {
    if (node.value === '') {
        node.classList.add('border-danger');
        setTimeout(() => node.classList.remove('border-danger'), 3000);
        return false;
    }
    return node.value;
}

