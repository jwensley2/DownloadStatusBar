import DownloadItem = browser.downloads.DownloadItem;
import DownloadQuery = browser.downloads.DownloadQuery;
import * as helpers from './helpers';

class DownloadStatus {
    protected downloads: DownloadItem[] = [];

    constructor() {
        const self = this;

        setInterval(() => {
            if (this.downloads.length > 0) {
                this.updateDownloads();
                this.updateTabs();
            }

        }, 1000);

        browser.downloads.onCreated.addListener(function (download) {
            self.downloadCreated(download);
        });

        browser.runtime.onMessage.addListener(function (request: any, sender: any, sendResponse: any) {
            if (request.event === 'clearDownloads') {
                self.downloads = helpers.filterCompletedDownloads(self.downloads);
                self.updateTabs();
            } else if (request.event === 'clearDownload') {
                self.downloads = helpers.removeSelectedDownload(request.download, self.downloads);
                self.updateTabs();
            } else if (request.event === 'showDownload') {
                self.showDownload(request.download);
            } else if (request.event === 'cancelDownload') {
                self.cancelDownload(request.download);
            } else if (request.event === 'pauseDownload') {
                self.pauseDownload(request.download);
            } else if (request.event === 'resumeDownload') {
                self.resumeDownload(request.download);
            }
        });
    }

    onError(error: Error) {
        console.log(`Error: ${error}`);
    }

    updateTabs() {
        let querying = browser.tabs.query({});

        querying.then((tabs) => {
            for (let tab of tabs) {
                if (tab.id) {
                    browser.tabs.sendMessage(tab.id, this.downloads);
                }
            }
        });
    };

    updateDownloads() {
        let query: DownloadQuery = {};

        for (let download of this.downloads) {
            query.id = download.id;

            let searching = browser.downloads.search(query);

            searching.then((downloads) => {
                let index = this.downloads.indexOf(download);
                if (index >= 0) {
                    this.downloads[index] = downloads[0];
                }
            }, (error) => {
                this.onError(error);
            });
        }
    }

    downloadCreated(download: DownloadItem) {
        this.downloads.push(download);
    }

    showDownload(download: DownloadItem) {
        browser.downloads.show(download.id);
    }

    cancelDownload(download: DownloadItem) {
        browser.downloads.cancel(download.id);
    }

    pauseDownload(download: DownloadItem) {
        browser.downloads.pause(download.id);
    }

    resumeDownload(download: DownloadItem) {
        browser.downloads.resume(download.id);
    }
}

let downloadStatus = new DownloadStatus();