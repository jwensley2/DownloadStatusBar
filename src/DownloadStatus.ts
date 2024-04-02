import moment from 'moment';
import {createPinia} from 'pinia';
import * as _ from 'lodash';
import {LocalOptions, SyncOptions} from './config/options';
import {DSBDownload, SerializedDownloadInterface} from './DSBDownload';
import {useSyncOptionsStore} from '@/stores/syncOptions';
import {filterFinishedDownloads, getInProgressDownloads, removeSelectedDownload, shouldHideDownload, shouldIgnoreDownload} from '@/helpers/downloads';
import DownloadQuery = browser.downloads.DownloadQuery;
import StringDelta = browser.downloads.StringDelta;
import BooleanDelta = browser.downloads.BooleanDelta;
import DoubleDelta = browser.downloads.DoubleDelta;

export default class DownloadStatus {
    protected downloads: DSBDownload[] = [];
    protected interval: number | null = null;

    protected pinia = createPinia();
    protected syncOptionsStore = useSyncOptionsStore(this.pinia);
    protected syncOptions: SyncOptions = this.syncOptionsStore.options;

    constructor() {
    }

    /**
     * Start event listeners
     */
    listen(): void {
        // Listen for download created events
        browser.downloads.onCreated.addListener((downloadItem) => {
            const download = new DSBDownload(downloadItem);

            this.syncOptions.minimized = false;
            this.syncOptionsStore.save();

            if (shouldIgnoreDownload(download, this.syncOptions)) {
                return;
            }

            this.downloads.push(download);
            this.startInterval();
        });

        // Listen for changes to the downloads
        browser.downloads.onChanged.addListener((downloadDelta) => {
            if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                const download = _.find(this.downloads, (dl) => {
                    return dl.downloadItem.id === downloadDelta.id;
                });

                if (!download) return;

                // Update changed properties
                for (const [property, change] of Object.entries(downloadDelta)) {
                    const downloadItem = download.downloadItem;
                    if (property === 'id') continue; // Ignore id
                    downloadItem[property] = (change as StringDelta | BooleanDelta | DoubleDelta).current;
                }

                // This downloadItem object is a delta of what changed so we need to query for the full downloadItem item
                const startTime = moment(download.downloadItem.startTime);

                // Add the final progress
                download.downloadProgress.push({
                    time: moment(),
                    bytesReceived: download.downloadItem.fileSize,
                });

                // Play sound if the download doesn't instantly finish
                if (moment().diff(startTime, 's') >= this.syncOptions.playSoundDownloadDuration) {
                    this.playCompletedSound();
                }

                if (shouldHideDownload(download, this.syncOptions)) {
                    setTimeout(() => {
                        this.clearDownload(download as DSBDownload);
                    }, this.syncOptions.autohideDuration * 1000);
                }

                this.updateTabs(this.downloads);
            } else {
                this.startInterval();
            }
        });

        // Listen for messages from the content script
        browser.runtime.onMessage.addListener((request): void => {
            if (!('event' in request && typeof request.event === 'string')) {
                return;
            }

            if ('download' in request) {
                const download = DSBDownload.fromJson(request.download as SerializedDownloadInterface);

                switch (request.event) {
                    case 'clearDownload':
                        this.clearDownload(download);
                        break;
                    case 'openDownload':
                        this.openDownload(download);
                        break;
                    case 'showDownload':
                        this.showDownload(download);
                        break;
                    case 'cancelDownload':
                        this.cancelDownload(download);
                        break;
                    case 'pauseDownload':
                        this.pauseDownload(download);
                        break;
                    case 'resumeDownload':
                        this.resumeDownload(download);
                        break;
                    case 'deleteDownload':
                        this.deleteDownload(download);
                        break;
                }
            }

            switch (request.event) {
                case 'clearDownloads':
                    this.clearDownloads();
                    break;
                case 'openOptions':
                    browser.runtime.openOptionsPage();
                    break;
            }
        });

        // Send the downloads to a tab when it loads
        browser.webNavigation.onCompleted.addListener((arg) => {
            browser.tabs.sendMessage(arg.tabId, {event: 'updateDownloads', downloads: this.downloads.map(d => d.toJSON())});
        });

        // When the active tab changes update it with the current downloads
        browser.tabs.onActivated.addListener((activeInfo) => {
            browser.tabs.sendMessage(activeInfo.tabId, {event: 'updateDownloads', downloads: this.downloads.map(d => d.toJSON())});
        });
    }

    /**
     * Refresh the downloads and tabs
     */
    refresh(): void {
        this.updateDownloads().then((downloads: DSBDownload[]) => {
            this.downloads = downloads;
            this.updateTabs(downloads);

            // If there are no downloads in progress stop the interval
            if (getInProgressDownloads(downloads).length <= 0) {
                this.stopInterval();
            }
        });
    }

    /**
     * Start an interval to keep the in progress downloads updated
     */
    startInterval() {
        if (this.interval) {
            return;
        }

        this.interval = window.setInterval(() => {
            this.refresh();
        }, this.syncOptions.refreshRate);
    }

    /**
     * Stop the interval
     */
    stopInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    onError(error: Error) {
        console.log(`Error: ${error}`);
    }

    /**
     * Update the browser tabs with the state of the downloads
     *
     * @param {DSBDownload[]} downloads
     * @param {boolean} activeOnly
     * @returns {Promise<void>}
     */
    updateTabs(downloads: DSBDownload[], activeOnly: boolean = true) {
        const query: { [propName: string]: unknown } = {};

        if (activeOnly) {
            query.active = true;
        }

        const querying = browser.tabs.query(query);

        return querying.then((tabs) => {
            for (const tab of tabs) {
                if (tab.id) {
                    browser.tabs.sendMessage(tab.id, {event: 'updateDownloads', downloads: this.downloads.map(d => d.toJSON())});
                }
            }
        });
    }

    /**
     * Update a single download
     * @param {DSBDownload} download
     */
    updateDownload(download: DSBDownload): Promise<DSBDownload> {
        const query: DownloadQuery = {
            id: download.downloadItem.id,
        };

        return new Promise<DSBDownload>((resolve, reject) => {
            browser.downloads.search(query).then((downloads) => {
                const first = _.first(downloads);

                if (first && first.id === download.downloadItem.id) {
                    download.updateDownload(first);
                    resolve(download);
                } else {
                    reject();
                }
            });
        });
    }

    /**
     * Update the state of the currently managed downloads
     *
     * @returns {Promise<DSBDownload[]>}
     */
    updateDownloads(): Promise<DSBDownload[]> {
        const promises: Promise<DSBDownload>[] = [];

        for (const download of this.downloads) {
            promises.push(this.updateDownload(download));
        }

        return Promise.all(promises);
    }

    /**
     * Clear a download from the status bar
     * @param {{id: number}} download
     */
    clearDownload(download: DSBDownload) {
        this.downloads = removeSelectedDownload(download.downloadItem, this.downloads);
        this.refresh();

        if (this.syncOptions.clearHistory) {
            browser.downloads.erase({
                id: download.downloadItem.id,
            });
        }
    }

    /**
     * Show a download in explorer/finder
     *
     * @param {DSBDownload} download
     */
    openDownload(download: DSBDownload) {
        browser.windows.create({
            url: browser.extension.getURL('confirmation.html') + `?id=${download.downloadItem.id}`,
            type: 'panel',
            width: 200,
            height: 100,
        });
    }

    /**
     * Show a download in explorer/finder
     *
     * @param {DSBDownload} download
     */
    showDownload(download: DSBDownload) {
        browser.downloads.show(download.downloadItem.id);
    }

    /**
     * Cancel a download
     *
     * @param {DSBDownload} download
     */
    cancelDownload(download: DSBDownload) {
        browser.downloads.cancel(download.downloadItem.id).then(() => {
            this.refresh();
        });
    }

    /**
     * Pause a running download
     *
     * @param {DSBDownload} download
     */
    pauseDownload(download: DSBDownload) {
        download.pause().then(() => {
            this.refresh();
        });
    }

    /**
     * Resume a paused download
     *
     * @param {DSBDownload} download
     */
    resumeDownload(download: DSBDownload) {
        download.resume().then(() => {
            this.refresh();
        });
    }

    /**
     * Delete a download file
     *
     * @param {DSBDownload} download
     */
    deleteDownload(download: DSBDownload) {
        browser.downloads.removeFile(download.downloadItem.id).then(() => {
            this.downloads = removeSelectedDownload(download.downloadItem, this.downloads);
            this.updateTabs(this.downloads);
        });
    }

    playCompletedSound() {
        if (!this.syncOptions.playSoundOnComplete) {
            return;
        }

        browser.storage.local.get('customSound').then((options: Partial<LocalOptions>) => {
            const audio = new Audio();

            if (options.customSound) {
                audio.src = browser.runtime.getURL(options.customSound.data);
            } else {
                audio.src = browser.runtime.getURL('sounds/complete.wav');
            }

            audio.play();
        });
    }

    clearDownloads() {
        this.downloads = filterFinishedDownloads(this.downloads, this.syncOptions.clearFailed);
        this.refresh();

        if (this.syncOptions.clearHistory) {
            browser.downloads.erase({state: 'complete'});
        }
    }
}
