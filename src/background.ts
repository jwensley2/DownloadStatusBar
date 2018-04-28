import moment = require('moment');
import DownloadQuery = browser.downloads.DownloadQuery;
import * as helpers from './helpers';
import * as _ from 'lodash';
import {defaultSyncOptions, LocalOptions, SyncOptions} from './config/options';
import {DownloadInterface, DSBDownload} from './DSBDownload';

class DownloadStatus {
    protected downloads: DSBDownload[] = [];
    protected interval: number | null;
    protected options: SyncOptions = defaultSyncOptions;

    constructor() {
        const self = this;

        browser.storage.sync.get(null)
            .then((options: SyncOptions) => {
                this.options = helpers.mergeSyncDefaultOptions(options);
            });

        browser.storage.onChanged.addListener((changedOptions) => {
            for (let item of Object.keys(changedOptions)) {
                this.options[item] = changedOptions[item].newValue;
            }
        });

        browser.downloads.onCreated.addListener((downloadItem) => {
            const download = new DSBDownload(downloadItem);

            this.options.minimized = false;
            helpers.saveOptionsToStorage(this.options);

            if (helpers.shouldIgnoreDownload(download, this.options)) {
                return;
            }

            self.downloads.push(download);
            self.startInterval();
        });

        browser.downloads.onChanged.addListener((downloadDelta) => {
            if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                let download = _.find(this.downloads, (dl) => {
                    return dl.downloadItem.id === downloadDelta.id;
                });

                if (!download) return;

                // This downloadItem object is a delta of what changed so we need to query for the full downloadItem item
                this.updateDownload(download).then((download) => {
                    let startTime = moment(download.downloadItem.startTime);

                    // Add the final progress
                    download.downloadProgress.push({
                        time: moment(),
                        bytesReceived: download.downloadItem.fileSize,
                    });

                    // Play sound if the download doesn't instantly finish
                    if (moment().diff(startTime, 's') > 1) {
                        this.playCompletedSound();
                    }

                    if (helpers.shouldHideDownload(download, this.options)) {
                        setTimeout(() => {
                            self.clearDownload(download);
                        }, this.options.autohideDuration * 1000);
                    }
                });
            } else {
                self.startInterval();
            }
        });

        browser.runtime.onMessage.addListener(function (request: any, sender: any, sendResponse: any) {
            if (request.download) {
                let download = DSBDownload.fromJson(JSON.parse(request.download) as DownloadInterface);

                switch (request.event) {
                    case 'clearDownload':
                        self.clearDownload(download);
                        break;
                    case 'openDownload':
                        self.openDownload(download);
                        break;
                    case 'showDownload':
                        self.showDownload(download);
                        break;
                    case 'cancelDownload':
                        self.cancelDownload(download);
                        break;
                    case 'pauseDownload':
                        self.pauseDownload(download);
                        break;
                    case 'resumeDownload':
                        self.resumeDownload(download);
                        break;
                    case 'deleteDownload':
                        self.deleteDownload(download);
                        break;
                }
            }

            switch (request.event) {
                case 'clearDownloads':
                    self.clearDownloads();
                    break;
                case 'openOptions':
                    browser.runtime.openOptionsPage();
                    break;
            }
        });

        // Send the downloads to a tab when it loads
        browser.webNavigation.onCompleted.addListener(function (arg: any) {
            browser.tabs.sendMessage(arg.tabId, JSON.stringify(self.downloads));
        });

        // When the active tab changes update it with the current downloads
        browser.tabs.onActivated.addListener(function (activeInfo: any) {
            browser.tabs.sendMessage(activeInfo.tabId, JSON.stringify(self.downloads));
        });
    }

    /**
     * Refresh the downloads and tabs
     */
    refresh() {
        this.updateDownloads().then((downloads: DSBDownload[]) => {
            this.downloads = downloads;
            this.updateTabs(downloads);

            // If there are no downloads in progress stop the interval
            if (helpers.getInProgressDownloads(downloads).length <= 0) {
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
        }, this.options.refreshRate);
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
        let query: any = {};

        if (activeOnly) {
            query.active = true;
        }

        let querying = browser.tabs.query(query);

        return querying.then((tabs) => {
            const json = JSON.stringify(downloads);

            for (let tab of tabs) {
                if (tab.id) {
                    browser.tabs.sendMessage(tab.id, json);
                }
            }
        });
    };

    updateDownload(download: DSBDownload) {
        let query: DownloadQuery = {
            id: download.downloadItem.id,
        };

        return new Promise<DSBDownload>((resolve, reject) => {
            browser.downloads.search(query).then((downloads) => {
                if (downloads.length > 0) {
                    download.updateDownload(downloads[0]);
                    resolve(download);
                } else {
                    reject();
                }
            })
        });
    }

    /**
     * Update the state of the currently managed downloads
     *
     * @returns {Promise<DSBDownload[]>}
     */
    updateDownloads(): Promise<DSBDownload[]> {
        let promises = [];

        for (let download of this.downloads) {
            promises.push(this.updateDownload(download));
        }

        return Promise.all(promises);
    }

    /**
     * Clear a download from the status bar
     * @param {{id: number}} download
     */
    clearDownload(download: DSBDownload) {
        this.downloads = helpers.removeSelectedDownload(download.downloadItem, this.downloads);
        this.refresh();

        if (this.options.clearHistory) {
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
            this.downloads = helpers.removeSelectedDownload(download.downloadItem, this.downloads);
            this.updateTabs(this.downloads);
        });
    }

    playCompletedSound() {
        if (!this.options.playSoundOnComplete) {
            return;
        }

        browser.storage.local.get('customSound').then((options: LocalOptions) => {
            let audio = new Audio();

            if (options.customSound) {
                audio.src = browser.runtime.getURL(options.customSound.data);
            } else {
                audio.src = browser.runtime.getURL('sounds/complete.wav');
            }

            audio.play();
        });
    }

    clearDownloads() {
        this.downloads = helpers.filterFinishedDownloads(this.downloads);
        this.refresh();

        if (this.options.clearHistory) {
            browser.downloads.erase({state: 'complete'});
        }
    }
}

let downloadStatus = new DownloadStatus();
