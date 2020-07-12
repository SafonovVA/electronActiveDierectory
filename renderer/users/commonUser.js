const userMethodsVisibilities = {
    get: true,
    add: true,
    exist: true,
    addToGroup: true
};

for (let methodVisibility in userMethodsVisibilities) {
    if (userMethodsVisibilities[methodVisibility] === true) {
        require(`./${methodVisibility}`);
    } else {
        document.querySelector(`#user-${methodVisibility}-div`).style.display = 'none';
    }
}

