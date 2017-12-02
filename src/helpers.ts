import DownloadItem = browser.downloads.DownloadItem;
import {defaultOptions, Options} from './config/options';
import fileTypes, {FileType} from './config/filetypes';
import * as _ from 'lodash';

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
 * Merge the default options into an options object
 *
 * @param {Options} options
 * @returns {Options}
 */
export function mergeDefaultOptions(options: Options): Options {
    let merged = Object.assign({}, defaultOptions, options);

    // Replace the saved types with the one in the config if it exists
    merged.autohideFileTypes = merged.autohideFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    return merged;
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
 * @param {Options} options
 * @returns {boolean}
 */
export function shouldHideDownload(download: DownloadItem, options: Options): boolean {
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