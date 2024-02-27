import _ from 'lodash';
import {createPinia} from 'pinia';
import {DSBDownload} from '@/DSBDownload';
import {useOptionsStore} from '@/stores/options';

const searchParams = new URLSearchParams(window.location.search);
const button = document.getElementById('open-download');
const downloadId = searchParams.get('id');

// Listen for a click on the button
if (button && downloadId) {
    button.addEventListener('click', () => {
        openDownload(parseInt(downloadId))
    });
}

/**
 * Open the download
 */
function openDownload(downloadId: number) {
    const pinia = createPinia();
    const options = useOptionsStore(pinia);

    if (downloadId) {
        browser.downloads.open(downloadId);
    }

    options.loadSyncOptions().then(() => {
        // Clear the download if the option is enabled
        if (options.syncOptions.clearAfterOpening) {
            browser.downloads.search({
                id: downloadId,
            }).then((downloads) => {
                const first = _.first(downloads);

                if (first) {
                    browser.runtime.sendMessage({event: 'clearDownload', download: JSON.stringify(new DSBDownload(first))});
                }
            });
        }

        // Close the current window
        browser.windows.getCurrent()
            .then((window) => {
                if (window.id) {
                    browser.windows.remove(window.id);
                }
            });
    });

}