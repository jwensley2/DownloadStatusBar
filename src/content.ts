import Vue, {VNode} from 'vue';
import Vuex from 'vuex';
import ContextMenuPlugin from './context-menu/ContextMenuPlugin';
import TooltipPlugin from './tooltip/TooltipPlugin';
import DownloadStatusBarComponent from './components/DownloadStatusBar.vue';
import {DownloadInterface, DSBDownload} from './DSBDownload';
import {DSBState, storeOptions} from './state';
import * as _ from 'lodash';
import {SyncOptions} from './config/options';
import * as helpers from './helpers';
import {Theme} from './config/themes';

class DownloadStatusBar {
    private app: Vue;
    protected _downloads: DSBDownload[] = [];

    constructor() {
        Vue.use(ContextMenuPlugin);
        Vue.use(TooltipPlugin);
        Vue.use(Vuex);

        const store = new Vuex.Store<DSBState>(storeOptions);

        let app = this.app = new Vue({
            el: this.makeStatusBarElement(),
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

    private static getStatusBarContainer() {
        const containerId = 'DownloadStatusBarContainer';
        let container;

        if (document.getElementById(containerId)) {
            container = document.getElementById(containerId) as HTMLElement;
        } else {
            container = document.createElement('div');
            container.id = containerId;
        }

        return container;
    }

    private makeStatusBarElement(): HTMLElement {
        const container = DownloadStatusBar.getStatusBarContainer();
        const shadow = container.attachShadow({mode: 'closed'});
        const innerContainer = document.createElement('div');
        const link = document.createElement('link') as HTMLLinkElement;

        document.body.appendChild(container);

        shadow.appendChild(link);
        shadow.appendChild(innerContainer);

        link.rel = 'stylesheet';
        link.href = browser.extension.getURL('content.css');

        return innerContainer;
    }

    public setTheme(theme: Theme) {
        let element = DownloadStatusBar.getStatusBarContainer();

        _.forEach(theme.colors, (colour, prop) => {
            element.style.setProperty(`--${prop}`, colour);
        })
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener((json: any) => {
    let downloads: DownloadInterface[] = JSON.parse(json);

    statusBar.downloads = downloads.map((downloadItem) => {
        return DSBDownload.fromJson(downloadItem);
    });
});

// Load the config and set the theme
browser.storage.sync.get(null)
    .then((options: SyncOptions) => {
        const syncOptions = helpers.mergeSyncDefaultOptions(options);
        const theme = helpers.getThemeById(syncOptions.theme, syncOptions.customThemes);
        statusBar.setTheme(theme);
    });

// Watch for config changes and update the theme
browser.storage.onChanged.addListener((changedOptions) => {
    const theme = helpers.getThemeById(changedOptions.theme.newValue, changedOptions.customThemes.newValue);
    statusBar.setTheme(theme);
});