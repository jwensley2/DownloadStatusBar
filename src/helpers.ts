import DownloadItem = browser.downloads.DownloadItem;
import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from './config/options';
import fileTypes, {FileType} from './config/filetypes';
import * as _ from 'lodash';
import * as moment from 'moment';

/**
 * Remove finished downloads from the array of downloads
 *
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function filterFinishedDownloads(downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (download: DownloadItem) {
        return download.state !== 'complete' && !wasDownloadCancelled(download);
    })
}

/**
 * Remove the passed download from the array of downloads
 *
 * @param {{ id: number }} download
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function removeSelectedDownload(download: { id: number }, downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (dl: DownloadItem) {
        return dl.id !== download.id;
    })
}

/**
 * Get in progress downloads
 *
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function getInProgressDownloads(downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (dl: DownloadItem) {
        return dl.state === 'in_progress';
    })
}

/**
 * Merge the default sync options into an sync options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export function mergeSyncDefaultOptions(options: SyncOptions): SyncOptions {
    let merged = Object.assign({}, defaultSyncOptions, options);

    // Replace the saved types with the one in the config if it exists
    merged.autohideFileTypes = merged.autohideFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    return merged;
}

/**
 * Merge the default local options into an local options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export function mergeLocalDefaultOptions(options: LocalOptions): LocalOptions {
    return Object.assign({}, defaultLocalOptions, options);
}

/**
 * Get a filetype by the name
 *
 * @param {string} ft
 * @returns {FileType | undefined}
 */
export function getFileTypeByName(ft: string): FileType | undefined {
    return _.find(_.flatMap(fileTypes), (fileType) => {
        return fileType.name === ft;
    });
}

/**
 * Check if a download should be automatically hidden
 *
 * @param {browser.downloads.DownloadItem} download
 * @param {SyncOptions} options
 * @returns {boolean}
 */
export function shouldHideDownload(download: DownloadItem, options: SyncOptions): boolean {
    const extension = _.last(download.filename.match(/\.(.*)/));

    if (!options.autohideEnable) {
        return false;
    }

    // Does the download match one of the selected file types
    const match = _.find(options.autohideFileTypes, (fileType) => {
        return fileType.mimes.indexOf(download.mime) !== -1 || (extension && fileType.extensions.indexOf(extension) !== -1);
    });

    // Hide it if there was a match
    if (match) {
        return true;
    }

    // Hide it the mime or extension matches one of the custom types
    if (options.autohideCustomTypes.indexOf(download.mime) !== -1 || (extension && options.autohideCustomTypes.indexOf(extension) !== -1)) {
        return true;
    }

    // Hide if there are no types configured
    return options.autohideCustomTypes.length === 0 && options.autohideFileTypes.length === 0;
}

/**
 * Format a filesize in bytes to KB, MB, GB or TB
 *
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes: number) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if a download was cancelled
 *
 * @param {browser.downloads.DownloadItem} download
 * @returns {boolean}
 */
export function wasDownloadCancelled(download: DownloadItem): boolean {
    if (download.paused) {
        return false;
    }

    return download.state === 'interrupted' && (download.error === 'USER_CANCELED' || download.error === 'USER_SHUTDOWN')
}

/**
 * Get a text representation of the status of a download
 *
 * @param {browser.downloads.DownloadItem} download
 * @returns {string}
 */
export function downloadStatus(download: DownloadItem) {
    if (download.state === 'complete') {
        return 'Complete';
    }

    if (download.paused) {
        return 'Paused';
    }

    if (wasDownloadCancelled(download)) {
        return `Cancelled`
    }

    if (download.error) {
        return `Error: ${download.error}`;
    }

    if (download.totalBytes === -1 || !download.estimatedEndTime) {
        return `In Progress`
    }

    let now = moment();
    let finish = moment(download.estimatedEndTime, moment.ISO_8601);

    return moment.duration(finish.diff(now), 'ms').humanize();
}

/**
 * Get the percent that a download is complete
 *
 * @param {browser.downloads.DownloadItem} download
 * @returns {string}
 */
export function downloadPercent(download: DownloadItem) {
    if (download.state === 'complete') {
        return '100';
    } else if (download.totalBytes < 0) {
        return '0';
    }

    return ((download.bytesReceived / download.totalBytes) * 100).toFixed(2);
}

/**
 * Get a text representation of the progress of a download
 *
 * @param {browser.downloads.DownloadItem} download
 * @returns {string}
 */
export function downloadProgress(download: DownloadItem): string {
    if (download.state === 'complete') {
        return `${formatFileSize(download.fileSize)}`;
    }

    if (download.totalBytes === -1) {
        return `${formatFileSize(download.bytesReceived)} / Unknown`
    }

    return `${download.bytesReceived} / ${download.totalBytes} - ${downloadPercent(download)}%`;
}

/**
 * Check if a download is an image
 * @param {browser.downloads.DownloadItem} download
 * @returns {boolean}
 */
export function downloadIsImage(download: DownloadItem) {
    if (download.mime && download.mime.includes('image/')) {
        return true;
    }

    const extension = _.last(download.filename.match(/\.(.*)/));
    const imageExtensions = ['gif', 'png', 'jpg', 'jpeg', 'bmp', 'webp'];

    if (!extension) {
        return false;
    }

    return imageExtensions.indexOf(extension) > 0;
}