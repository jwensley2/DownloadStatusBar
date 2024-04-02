import {ComponentPublicInstance, createApp, watch} from 'vue';
import {createPinia} from 'pinia';
import * as _ from 'lodash';
import {DSBDownload} from '@/DSBDownload';
import {useDownloadsStore} from '@/stores/downloads';
import {useSyncOptionsStore} from '@/stores/syncOptions';
import {SyncOptions} from '@/config/options';
import events from '@/events';
import ContextMenuPlugin from '@/context-menu/ContextMenuPlugin';
import TooltipPlugin from '@/tooltip/TooltipPlugin';
import DownloadStatusBarComponent from '@/components/DownloadStatusBar.vue';
import {getThemeById} from '@/helpers/getThemeById';

export default class DownloadStatusBar {
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

        const syncOptionsStore = useSyncOptionsStore();

        watch(() => syncOptionsStore.options, (value) => {
            // Set styles when the options change
            this.setStyles(value);
        }, {deep: true});
    }

    set downloads(downloads: DSBDownload[]) {
        const store = useDownloadsStore();
        this._downloads = downloads;
        store.setDownloads(downloads);
    }

    /**
     * Start event listeners
     */
    listen(): void {
        events.on('clearDownloads', () => {
            // Tell the background to clear its downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});
        });

        events.on('clearDownload', (download: DSBDownload) => {
            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: download.toJSON()});
        });

        events.on('openDownload', (download: DSBDownload) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'openDownload', download: download.toJSON()});
        });

        events.on('showDownload', (download: DSBDownload) => {
            // Tell the background process to show the download
            browser.runtime.sendMessage({event: 'showDownload', download: download.toJSON()});
        });

        events.on('cancelDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'cancelDownload', download: download.toJSON()});
        });

        events.on('pauseDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'pauseDownload', download: download.toJSON()});
        });

        events.on('resumeDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'resumeDownload', download: download.toJSON()});
        });

        events.on('deleteDownload', (download: DSBDownload) => {
            browser.runtime.sendMessage({event: 'deleteDownload', download: download.toJSON()});
        });

        events.on('openOptions', () => {
            browser.runtime.sendMessage({event: 'openOptions'});
        });
    }

    private static getStatusBarContainer() {
        const containerId = 'DownloadStatusBarContainer';

        if (document.getElementById(containerId)) {
            return document.getElementById(containerId) as HTMLElement;
        }

        const container = document.createElement('div');
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

    public setStyles(options: SyncOptions) {
        const theme = getThemeById(options.theme, options.customThemes);
        const element = DownloadStatusBar.getStatusBarContainer();

        // Prevent some sites from breaking
        element.style.setProperty('height', 'auto');
        element.style.setProperty('width', 'auto');
        element.style.setProperty('display', 'block');

        element.style.setProperty('--font-size', `${options.fontSize}px`);

        _.forEach(theme.colors, (colour, prop) => {
            element.style.setProperty(`--${prop}`, colour);
        });
    }
}
