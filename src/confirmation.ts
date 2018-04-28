const searchParams = new URLSearchParams(window.location.search);
const button = document.getElementById('open-download');
const downloadId = searchParams.get('id');

// Listen for a click on the button
if (button) {
    button.addEventListener('click', openDownload);
}

/**
 * Open the download
 */
function openDownload() {
    if (downloadId) {
        browser.downloads.open(parseInt(downloadId));
    }

    // Close the current window
    browser.windows.getCurrent()
        .then((window) => {
            if (window.id) {
                browser.windows.remove(window.id);
            }
        });
}