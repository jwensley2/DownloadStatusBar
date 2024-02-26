import DownloadItem = browser.downloads.DownloadItem;
import * as _ from 'lodash';
import * as helpers from './helpers';
import moment from 'moment';
import {Moment} from 'moment';

type DownloadProgress = { time: Moment, bytesReceived: number };

export interface DownloadInterface {
    downloadItem: DownloadItem,
    downloadProgress: DownloadProgress[],
}

export class DSBDownload implements DownloadInterface {
    protected _downloadItem: DownloadItem;
    protected _downloadProgress: DownloadProgress[] = [];

    constructor(downloadItem: DownloadItem) {
        this._downloadItem = downloadItem;

        this.downloadProgress.push({
            time: moment(downloadItem.startTime),
            bytesReceived: downloadItem.bytesReceived,
        });
    }

    static fromJson(json: DownloadInterface) {
        let download = new this(json.downloadItem);

        // Convert the serialized progress to the proper form
        download._downloadProgress = json.downloadProgress.map((progress) => {
            progress.time = moment(progress.time);
            return progress;
        });

        return download;
    }

    toJSON() {
        return {
            downloadItem: this.downloadItem,
            downloadProgress: this.downloadProgress,
        }
    }

    get downloadItem() {
        return this._downloadItem;
    }

    get downloadProgress() {
        return this._downloadProgress;
    }

    updateDownload(downloadItem: DownloadItem, time?: Moment) {
        this._downloadItem = downloadItem;

        if (downloadItem.state !== 'complete') {
            this.downloadProgress.push({
                time: time || moment(),
                bytesReceived: downloadItem.bytesReceived,
            });
        }

        // Only keep the 10 most recent samples
        this.downloadProgress.splice(0, this.downloadProgress.length - 10);
    }

    /**
     * Calculate the download speed in bytes/s
     * @returns {number}
     */
    calculateDownloadSpeed(sampleSize = 10): number {
        // Get the X most recent samples of the progress
        const samples = this.downloadProgress.slice(-sampleSize);

        if (samples.length === 0) {
            return 0;
        }

        // Get the first and last of the samples
        const first = _.first(samples)!;
        const last = _.last(samples)!;

        // Calculate the total time and bytes between the first and last samples
        const totalTime = Math.max((last.time.diff(first.time, 's')), 1);
        const totalBytes = last.bytesReceived - first.bytesReceived;

        if (totalBytes <= 0) return 0;
        if (totalTime <= 0) return totalBytes;

        return Math.round(totalBytes / totalTime);
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
        const totalSize = this.downloadItem.totalBytes > 0 ? helpers.formatFileSize(this.downloadItem.totalBytes) : 0;

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
    percentDownloaded(): number {
        if (this.downloadItem.state === 'complete') {
            return 100;
        } else if (this.downloadItem.totalBytes <= 0) {
            return 0;
        }

        return Math.floor((this.downloadItem.bytesReceived / this.downloadItem.totalBytes) * 100);
    }

    /**
     * Get a text representation of the status of a download
     *
     * @returns {string}
     */
    status() {
        if (this.downloadItem.state === 'complete') {
            return helpers.localize('downloadStatusComplete');
        }

        if (this.downloadItem.paused) {
            return helpers.localize('downloadStatusPaused');
        }

        if (this.isCancelled()) {
            return helpers.localize('downloadStatusCancelled')
        }

        if (this.downloadItem.error) {
            return `${helpers.localize('downloadStatusError')}: ${this.downloadItem.error}`;
        }

        if (this.downloadItem.totalBytes === -1 || !this.downloadItem.estimatedEndTime) {
            return helpers.localize('downloadStatusInProgress')
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
        return browser.downloads.resume(this.downloadItem.id);
    }
}