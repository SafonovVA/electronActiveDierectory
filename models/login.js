const AD = require('ad');
const constants = require('../../appConfig.js');

let submit = document.querySelector('#login-submit');

submit.onclick = async () => {
    let loginUsername = document.querySelector('#login-username');
    let loginPassword = document.querySelector('#login-password');
    if (loginUsername.value === '') {
        alert('Username is required');
        return false;
    }

    if (loginPassword.value === '') {
        alert('Password is required');
        return false;
    }
    try {
        const ad = new AD({
            url: constants.url,
            baseDN: constants.baseDN,
            user: loginUsername.value + constants.postfix,
            pass: loginPassword.value
        });

        let authenticated = await authenticate(ad, loginUsername.value, loginPassword.value)
            .then(result => {
                return result === true ? true : false;
            })
            .catch(() => false);

        if (authenticated === true) {
            return true;
        }

        console.log(authenticated);
        return false;
    } catch (e) {
        alert(e.message);
        return false;
    }

};

function authenticate(ad, username, password) {
    return ad.user(username).authenticate(password);
}