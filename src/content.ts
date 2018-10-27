import Vue, {VNode} from 'vue';
import Vuex from 'vuex';
import ContextMenuPlugin from './context-menu/ContextMenuPlugin';
import Tooltip from './tooltip/Tooltip';
import DownloadStatusBarComponent from './components/DownloadStatusBar.vue';
import {DownloadInterface, DSBDownload} from './DSBDownload';
import {DSBState, storeOptions} from './state';

class DownloadStatusBar {
    private app: Vue;
    protected _downloads: DSBDownload[] = [];

    constructor() {
        Vue.use(ContextMenuPlugin);
        Vue.use(Tooltip);
        Vue.use(Vuex);

        const store = new Vuex.Store<DSBState>(storeOptions);

        let app = this.app = new Vue({
            el: DownloadStatusBar.makeStatusBarElement(),
            store,
            render(render): VNode {
                return render(DownloadStatusBarComponent);
            },
        });

        app.$on('clearDownloads', () => {
            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});

            // Close the context menu
            this.app.$contextMenu.close();
        });

        app.$on('clearDownload', (download: DSBDownload) => {
            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: JSON.stringify(download)});
        });

        app.$on('openDownload', (download: DSBDownload) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'openDownload', download: JSON.stringify(download)});
        });

        app.$on('showDownload', (download: DSBDownload) => {
            // Tell the background process to show the download
            browser.runtime.sendMessage({event: 'showDownload', download: JSON.stringify(download)});
        });

        app.$on('cancelDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'cancelDownload', download: JSON.stringify(download)});
        });

        app.$on('pauseDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'pauseDownload', download: JSON.stringify(download)});
        });

        app.$on('resumeDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'resumeDownload', download: JSON.stringify(download)});
        });

        app.$on('deleteDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'deleteDownload', download: JSON.stringify(download)});
        });

        app.$on('openOptions', () => {
            browser.runtime.sendMessage({event: 'openOptions'});
        });
    }

    set downloads(downloads: DSBDownload[]) {
        this._downloads = downloads;
        this.app.$store.commit('setDownloads', downloads);
    }

    private static makeStatusBarElement(): HTMLElement {
        const outerContainer = document.createElement('div');
        const innerContainer = document.createElement('div');
        const shadow = outerContainer.attachShadow({mode: 'closed'});
        const link = document.createElement('link') as HTMLLinkElement;

        link.rel='stylesheet';
        link.href = browser.extension.getURL('content.css');

        document.body.appendChild(outerContainer);
        shadow.appendChild(link);
        shadow.appendChild(innerContainer);
        innerContainer.id = 'DownloadStatusBarContainer';

        return innerContainer;
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener((json: any) => {
    let downloads: DownloadInterface[] = JSON.parse(json);

    statusBar.downloads = downloads.map((downloadItem) => {
        return DSBDownload.fromJson(downloadItem);
    });
});
