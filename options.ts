function saveOptions(e: Event) {
    let theme = document.querySelector('input[name=theme]:checked') as HTMLInputElement;

    e.preventDefault();

    browser.storage.sync.set({
        theme: theme.value
    });
}

function restoreOptions() {
    let gettingItem = browser.storage.sync.get('theme');
    gettingItem.then((res) => {
        if (res.theme) {
            let theme = document.querySelector(`input[value=${res.theme}]`) as HTMLInputElement;
            theme.checked = true;
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')!.addEventListener('submit', saveOptions);