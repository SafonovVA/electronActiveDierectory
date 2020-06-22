const storage = new (require('electron-store'))();
const themeSelector = document.querySelector('#theme-select');
const themeStyle = document.querySelector('#theme-style');
const themeStyleLink = {
    light: '../resources/css/light.bootstrap.min.css',
    dark: '../resources/css/dark.bootstrap.min.css'
}

themeSelector.onclick = () => {
    themeStyle.href = themeStyle.href.includes('light') ? themeStyleLink.dark : themeStyleLink.light;
    storage.set('theme', themeStyle.href);
}

document.addEventListener('DOMContentLoaded', () => {
    if (storage.has('theme')) {
        const currentTheme = storage.get('theme');
        themeStyle.href = storage.get('theme');
        themeSelector.checked = currentTheme.includes('dark');
    }


});