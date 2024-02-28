import {ComponentPublicInstance, createApp} from 'vue';
import {createPinia} from 'pinia'
import ContextMenuPlugin from './context-menu/ContextMenuPlugin';
import TooltipPlugin from './tooltip/TooltipPlugin';
import DownloadStatusBarComponent from './components/DownloadStatusBar.vue';
import {DownloadInterface, DSBDownload} from './DSBDownload';
import * as _ from 'lodash';
import * as helpers from './helpers';
import {Theme} from './config/themes';
import {useDownloadsStore} from './stores/downloads';
import events from './events';
import StorageObject = browser.storage.StorageObject;

class DownloadStatusBar {
    private app: ComponentPublicInstance;
    protected _downloads: DSBDownload[] = [];

    constructor() {
        const rootElement = this.makeStatusBarElement();

        this.app = createApp(DownloadStatusBarComponent)
            .use(createPinia())
            .use(ContextMenuPlugin)
            .use(TooltipPlugin)
            .provide('rootElement', rootElement)
            .mount(rootElement);

        events.on('clearDownloads', () => {
            // Tell the background to clear its downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});
        });

        events.on('clearDownload', (download: DSBDownload) => {
            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: JSON.stringify(download)});
        });

        events.on('openDownload', (download: DSBDownload) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'openDownload', download: JSON.stringify(download)});
        });

        events.on('showDownload', (download: DSBDownload) => {
            // Tell the background process to show the download
            browser.runtime.sendMessage({event: 'showDownload', download: JSON.stringify(download)});
        });

        events.on('cancelDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'cancelDownload', download: JSON.stringify(download)});
        });

        events.on('pauseDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'pauseDownload', download: JSON.stringify(download)});
        });

        events.on('resumeDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'resumeDownload', download: JSON.stringify(download)});
        });

        events.on('deleteDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'deleteDownload', download: JSON.stringify(download)});
        });

        events.on('openOptions', () => {
            browser.runtime.sendMessage({event: 'openOptions'});
        });
    }

    set downloads(downloads: DSBDownload[]) {
        const store = useDownloadsStore();
        this._downloads = downloads;
        store.setDownloads(downloads);
    }

    private static getStatusBarContainer() {
        const containerId = 'DownloadStatusBarContainer';
        let container;

        if (document.getElementById(containerId)) {
            return document.getElementById(containerId) as HTMLElement;
        }

        container = document.createElement('div');
        container.id = containerId;

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

        // Prevent some sites from breaking
        element.style.setProperty('height', 'auto');
        element.style.setProperty('width', 'auto');
        element.style.setProperty('display', 'block');

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
    .then((options: StorageObject) => {
        const syncOptions = helpers.mergeSyncDefaultOptions(options);
        const theme = helpers.getThemeById(syncOptions.theme, syncOptions.customThemes);
        statusBar.setTheme(theme);
    });

// Watch for config changes and update the theme
browser.storage.onChanged.addListener((changedOptions, areaName) => {
    if (areaName === 'sync') {
        const theme = helpers.getThemeById(changedOptions.theme.newValue, changedOptions.customThemes.newValue);
        statusBar.setTheme(theme);
    }
});