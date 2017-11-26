import Vue, {VNode} from 'vue';
import ContextMenu from './context-menu/ContextMenu';
import App from './components/App.vue';
import * as helpers from './helpers';
import DownloadItem = browser.downloads.DownloadItem;

class DownloadStatusBar {
    private app: Vue;
    protected _downloads: DownloadItem[] = [];
    protected statusBar: HTMLElement = DownloadStatusBar.makeStatusBarElement();

    constructor() {
        let self = this;

        if (document.getElementById('DownloadStatusBarContainer')) {
            this.statusBar = document.getElementById('DownloadStatusBarContainer')!;
        } else {
            document.body.appendChild(this.statusBar);
        }

        Vue.use(ContextMenu);

        let app = this.app = new Vue({
            el: '#DownloadStatusBarContainer',
            data: {
                theme: 'light',
                downloads: [],
            },
            render(render): VNode {
                return render(App, {
                    props: {
                        theme: this.theme,
                        downloads: this.downloads,
                    }
                });
            }
        });

        // Get the theme from local storage
        browser.storage.sync.get('theme').then(function (res) {
            if (res.theme) {
                app.$data.theme = res.theme;
            }
        });

        app.$on('clearDownloads', () => {
            // Clear the locally stored downloads
            this.downloads = helpers.filterCompletedDownloads(this._downloads);

            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});

            // Close the context menu
            this.app.$contextMenu.close();
        });

        app.$on('clearDownload', (download: DownloadItem) => {
            // Filter out the cleared download
            this.downloads = helpers.removeSelectedDownload(download, this._downloads);

            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: download});
        });

        app.$on('showDownload', (download: DownloadItem) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'showDownload', download: download});
        });

        app.$on('cancelDownload', (download: DownloadItem) => {
            browser.runtime.sendMessage({event: 'cancelDownload', download: download});
        });

        app.$on('pauseDownload', (download: DownloadItem) => {
            browser.runtime.sendMessage({event: 'pauseDownload', download: download});
        });

        app.$on('resumeDownload', (download: DownloadItem) => {
            browser.runtime.sendMessage({event: 'resumeDownload', download: download});
        });
    }

    set downloads(downloads: DownloadItem[]) {
        this._downloads = downloads;
        this.app.$data.downloads = downloads;
    }

    private static makeStatusBarElement(): HTMLElement {
        let container = document.createElement('div');

        container.id = 'DownloadStatusBarContainer';

        return container;
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener(function (downloads: DownloadItem[]) {
    statusBar.downloads = downloads;
});