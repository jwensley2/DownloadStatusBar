import DownloadItem = browser.downloads.DownloadItem;
import DownloadQuery = browser.downloads.DownloadQuery;
import * as helpers from './helpers';
import {SyncOptions, defaultSyncOptions, LocalOptions} from './config/options';
import download = browser.downloads.download;
import moment = require('moment');

class DownloadStatus {
    protected downloads: DownloadItem[] = [];
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

        browser.downloads.onCreated.addListener(function (download) {
            self.downloads.push(download);
            self.startInterval();
        });

        browser.downloads.onChanged.addListener((downloadDelta) => {
            if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                // This download object is a delta of what changed so we need to query for the full download item
                this.getDownloadItem(downloadDelta.id).then((download) => {
                    let startTime = moment(download.startTime);

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
            if (request.event === 'clearDownloads') {
                self.downloads = helpers.filterFinishedDownloads(self.downloads);
                self.refresh();
            } else if (request.event === 'clearDownload') {
                self.clearDownload(request.download);
            } else if (request.event === 'showDownload') {
                self.showDownload(request.download);
            } else if (request.event === 'cancelDownload') {
                self.cancelDownload(request.download);
            } else if (request.event === 'pauseDownload') {
                self.pauseDownload(request.download);
            } else if (request.event === 'resumeDownload') {
                self.resumeDownload(request.download);
            } else if (request.event === 'deleteDownload') {
                self.deleteDownload(request.download);
            } else if (request.event === 'openOptions') {
                browser.runtime.openOptionsPage();
            }
        });

        // Send the downloads to a tab when it loads
        browser.webNavigation.onCompleted.addListener(function (arg: any) {
            browser.tabs.sendMessage(arg.tabId, self.downloads);
        });
    }

    /**
     * Refresh the downloads and tabs
     */
    refresh() {
        this.updateDownloads().then((downloads: DownloadItem[]) => {
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

        this.interval = setInterval(() => {
            this.refresh();
        }, 1000);
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

    getDownloadItem(downloadId: number) {
        let query: DownloadQuery = {
            id: downloadId,
        };

        return new Promise<DownloadItem>((resolve, reject) => {
            browser.downloads.search(query).then((downloads) => {
                if (downloads.length > 0) {
                    resolve(downloads[0]);
                } else {
                    reject();
                }
            })
        });
    }

    /**
     * Update the browser tabs with the state of the downloads
     *
     * @param {browser.downloads.DownloadItem[]} downloads
     * @returns {Promise<void>}
     */
    updateTabs(downloads: DownloadItem[]) {
        let querying = browser.tabs.query({});

        return querying.then((tabs) => {
            for (let tab of tabs) {
                if (tab.id) {
                    browser.tabs.sendMessage(tab.id, downloads);
                }
            }
        });
    };

    /**
     * Update the state of the currently managed downloads
     *
     * @returns {Promise<browser.downloads.DownloadItem[]>}
     */
    updateDownloads(): Promise<DownloadItem[]> {
        let promises = [];

        for (let download of this.downloads) {
            let promise = new Promise<DownloadItem>((resolve, reject) => {
                let query: DownloadQuery = {id: download.id};

                browser.downloads.search(query).then((downloads) => {
                    resolve(downloads[0]);
                }, (error) => {
                    this.onError(error);
                    reject();
                });
            });

            promises.push(promise);
        }

        return Promise.all(promises);
    }

    /**
     * Clear a download from the status bar
     * @param {{id: number}} download
     */
    clearDownload(download: DownloadItem) {
        this.downloads = helpers.removeSelectedDownload(download, this.downloads);
        this.refresh();
    }

    /**
     * Show a download in explorer/finder
     *
     * @param {browser.downloads.DownloadItem} download
     */
    showDownload(download: DownloadItem) {
        browser.downloads.show(download.id);
    }

    /**
     * Cancel a download
     *
     * @param {browser.downloads.DownloadItem} download
     */
    cancelDownload(download: DownloadItem) {
        browser.downloads.cancel(download.id).then(() => {
            this.refresh();
        });
    }

    /**
     * Pause a running download
     *
     * @param {browser.downloads.DownloadItem} download
     */
    pauseDownload(download: DownloadItem) {
        browser.downloads.pause(download.id).then(() => {
            this.refresh();
        });
    }

    /**
     * Resume a paused download
     *
     * @param {browser.downloads.DownloadItem} download
     */
    resumeDownload(download: DownloadItem) {
        browser.downloads.resume(download.id).then(() => {
            this.refresh();
        });
    }

    /**
     * Delete a download file
     *
     * @param {browser.downloads.DownloadItem} download
     */
    deleteDownload(download: DownloadItem) {
        browser.downloads.removeFile(download.id).then(() => {
            this.downloads = helpers.removeSelectedDownload(download, this.downloads);
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
}

let downloadStatus = new DownloadStatus();