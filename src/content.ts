import Vue, {VNode} from 'vue';
import * as helpers from './helpers';
import ContextMenu from './context-menu/ContextMenu';
import Tooltip from './tooltip/Tooltip';
import DownloadStatusBarComponent from './components/DownloadStatusBar.vue';
import {DSBDownload} from './DSBDownloadItem';
import DownloadItem = browser.downloads.DownloadItem;

class DownloadStatusBar {
    private app: Vue;
    protected _downloads: DSBDownload[] = [];
    protected statusBar: HTMLElement = DownloadStatusBar.makeStatusBarElement();

    constructor() {
        if (document.getElementById('DownloadStatusBarContainer')) {
            this.statusBar = document.getElementById('DownloadStatusBarContainer')!;
        } else {
            document.body.appendChild(this.statusBar);
        }

        Vue.use(ContextMenu);
        Vue.use(Tooltip);

        let app = this.app = new Vue({
            el: '#DownloadStatusBarContainer',
            data: {
                downloads: [],
            },
            render(render): VNode {
                return render(DownloadStatusBarComponent, {
                    props: {
                        downloads: this.downloads,
                    },
                });
            },
        });

        app.$on('clearDownloads', () => {
            // Clear the locally stored downloads
            this.downloads = helpers.filterFinishedDownloads(this._downloads);

            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});

            // Close the context menu
            this.app.$contextMenu.close();
        });

        app.$on('clearDownload', (downloadItem: DSBDownload) => {
            // Filter out the cleared download
            this.downloads = helpers.removeSelectedDownload(downloadItem.downloadItem, this._downloads);

            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: downloadItem});
        });

        app.$on('showDownload', (downloadItem: DSBDownload) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'showDownload', download: downloadItem});
        });

        app.$on('cancelDownload', (downloadItem: DSBDownload) => {
            browser.runtime.sendMessage({event: 'cancelDownload', download: downloadItem});
        });

        app.$on('pauseDownload', (downloadItem: DSBDownload) => {
            browser.runtime.sendMessage({event: 'pauseDownload', download: downloadItem});
        });

        app.$on('resumeDownload', (downloadItem: DSBDownload) => {
            browser.runtime.sendMessage({event: 'resumeDownload', download: downloadItem});
        });

        app.$on('deleteDownload', (downloadItem: DSBDownload) => {
            browser.runtime.sendMessage({event: 'deleteDownload', download: downloadItem});
        });

        app.$on('openOptions', () => {
            browser.runtime.sendMessage({event: 'openOptions'});
        });
    }

    set downloads(downloads: DSBDownload[]) {
        this._downloads = downloads;
        this.app.$data['downloads'] = downloads;
    }

    private static makeStatusBarElement(): HTMLElement {
        let container = document.createElement('div');

        container.id = 'DownloadStatusBarContainer';

        return container;
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener(function (downloads: DownloadItem[]) {
    statusBar.downloads = downloads.map((downloadItem) => {
        return new DSBDownload(downloadItem);
    });
});