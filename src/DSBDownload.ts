import DownloadItem = browser.downloads.DownloadItem;
import * as _ from 'lodash';
import * as helpers from './helpers';
import * as moment from 'moment';
import {Moment} from 'moment';

type DownloadProgress = { time: Moment, bytesReceived: number };

export class DSBDownload {
    protected _downloadItem: DownloadItem;
    protected downloadProgress: DownloadProgress[] = [];

    constructor(downloadItem: DownloadItem) {
        this._downloadItem = downloadItem;

        this.downloadProgress.push({
            time: moment(downloadItem.startTime),
            bytesReceived: downloadItem.bytesReceived,
        });
    }

    get downloadItem() {
        return this._downloadItem;
    }

    updateDownload(downloadItem: DownloadItem, time?: Moment) {
        this._downloadItem = downloadItem;

        this.downloadProgress.push({
            time: time || moment(),
            bytesReceived: downloadItem.bytesReceived,
        });
    }

    /**
     * Calculate the download speed in bytes/s
     * @returns {number}
     */
    calculateDownloadSpeed() {
        // Get the 5 most recent samples of the progress
        const samples = this.downloadProgress.slice(-5);

        // Get the first and last of the samples
        const first = _.first(samples);
        const last = _.last(samples);

        // Calculate the total time and bytes between the first and last samples
        const totalTime = Math.max((last.time.diff(first.time, 's')), 1);
        const totalBytes = last.bytesReceived - first.bytesReceived;

        return totalBytes / totalTime;
    }

    /**
     * Get the filename, without the path
     *
     * @returns {string}
     */
    filename() {
        let m = this.downloadItem.filename.toString().match(/.*[\/\\](.+)/);

        if (m && m.length > 1) {
            return m[m.length - 1];
        }

        return '';
    }

    /**
     * Check if the download was cancelled
     *
     * @returns {boolean}
     */
    isCancelled(): boolean {
        if (this.downloadItem.paused) {
            return false;
        }

        return this.downloadItem.state === 'interrupted' && (this.downloadItem.error === 'USER_CANCELED' || this.downloadItem.error === 'USER_SHUTDOWN')
    }

    /**
     * Is the download an image
     * @returns {boolean}
     */
    isImage(): boolean {
        if (this.downloadItem.mime && this.downloadItem.mime.includes('image/')) {
            return true;
        }

        const extension = _.last(this.downloadItem.filename.match(/\.(.*)/));
        const imageExtensions = ['gif', 'png', 'jpg', 'jpeg', 'bmp', 'webp'];

        if (!extension) {
            return false;
        }

        return imageExtensions.indexOf(extension) > 0;
    }

    /**
     * Get a text representation of the progress of a download
     *
     * @returns {string}
     */
    progress(): string {
        const downloaded = helpers.formatFileSize(this.downloadItem.bytesReceived);
        const totalSize = helpers.formatFileSize(this.downloadItem.totalBytes);

        if (this.downloadItem.state === 'complete') {
            return `${helpers.formatFileSize(this.downloadItem.fileSize)}`;
        }

        if (this.downloadItem.totalBytes === -1) {
            return `${downloaded} / Unknown`
        }

        return `${downloaded} / ${totalSize} - ${this.percentDownloaded()}%`;
    }

    /**
     * Get the percentage that has been downloaded
     *
     * @returns {string}
     */
    percentDownloaded(): string {
        if (this.downloadItem.state === 'complete') {
            return '100';
        } else if (this.downloadItem.totalBytes < 0) {
            return '0';
        }

        return ((this.downloadItem.bytesReceived / this.downloadItem.totalBytes) * 100).toFixed(2);
    }

    /**
     * Get a text representation of the status of a download
     *
     * @returns {string}
     */
    status() {
        if (this.downloadItem.state === 'complete') {
            return 'Complete';
        }

        if (this.downloadItem.paused) {
            return 'Paused';
        }

        if (this.isCancelled()) {
            return `Cancelled`
        }

        if (this.downloadItem.error) {
            return `Error: ${this.downloadItem.error}`;
        }

        if (this.downloadItem.totalBytes === -1 || !this.downloadItem.estimatedEndTime) {
            return `In Progress`
        }

        let now = moment();
        let finish = moment(this.downloadItem.estimatedEndTime, moment.ISO_8601);

        return moment.duration(finish.diff(now), 'ms').humanize();
    }

    /**
     * Pause the download
     *
     * @returns {Promise<void>}
     */
    pause() {
        return browser.downloads.pause(this.downloadItem.id);
    }

    /**
     * Resume the download
     *
     * @returns {Promise<void>}
     */
    resume() {
        return browser.downloads.pause(this.downloadItem.id);
    }
}