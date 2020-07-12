require('../common');
const {ipcRenderer} = require('electron');
const AD = require('ad');
const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
const resultInput = document.querySelector('#user-exist-result');

const buttonUsersExist = document.querySelector('#button-user-exist');

buttonUsersExist.onclick = async () => {
    buttonUsersExist.insertAdjacentHTML('afterbegin', spinner);

    const adConfig = ipcRenderer.sendSync('give-ad-config');
    const ad = new AD(adConfig);
    const userName = checkNodeIsEmpty(document.querySelector('#user-exist-username'));

    try {
        if (userName === false) {
            return false;
        }

        const isUserExist = await ad.user(userName).exists();
        changeResultInputValue(isUserExist);
    } catch (error) {
        ipcRenderer.send('open-info-dialog', 'User exist error', error.message);
    } finally {
        hideAnimationButton(buttonUsersExist);
    }
};

function changeResultInputValue(isUserExist) {
    let classes = ['bg-danger', 'bg-success'];
    isUserExist !== true && classes.reverse();
    resultInput.classList.contains(classes[0]) && resultInput.classList.remove(classes[0]);
    resultInput.classList.contains(classes[1]) || resultInput.classList.add(classes[1]);
    resultInput.value = isUserExist === true ? 'User exist' : 'User does not exist';
}

function hideAnimationButton(button) {
    const buttonSelector = button.querySelector('[role="status"]');
    if (buttonSelector) {
        buttonSelector.remove();
    }
}

function checkNodeIsEmpty(node) {
    if (node.value === '') {
        node.classList.add('border-danger');
        setTimeout(() => node.classList.remove('border-danger'), 3000);
        ipcRenderer.send('open-error-dialog', 'Username field error', 'Username field cannot be empty');
        return false;
    }
    return node.value;
}

