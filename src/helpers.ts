import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from './config/options';
import fileTypes, {FileType} from './config/filetypes';
import * as _ from 'lodash';
import {DSBDownload} from './DSBDownloadItem';

/**
 * Remove finished downloads from the array of downloads
 *
 * @param {DSBDownload[]} downloads
 * @returns {DSBDownload[]}
 */
export function filterFinishedDownloads(downloads: DSBDownload[]): DSBDownload[] {
    return downloads.filter(function (download: DSBDownload) {
        const downloadItem = download.downloadItem;

        if (downloadItem.error && !downloadItem.paused) {
            return false;
        }

        return downloadItem.state === 'in_progress' || downloadItem.paused;
    })
}

/**
 * Remove the passed download from the array of downloads
 *
 * @param {{ id: number }} download
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function removeSelectedDownload(download: { id: number }, downloads: DSBDownload[]): DSBDownload[] {
    return downloads.filter(function (dl: DSBDownload) {
        return dl.downloadItem.id !== download.id;
    })
}

/**
 * Get in progress downloads
 *
 * @param {DSBDownload[]} downloads
 * @returns {DSBDownload[]}
 */
export function getInProgressDownloads(downloads: DSBDownload[]): DSBDownload[] {
    return downloads.filter(function (dl: DSBDownload) {
        return dl.downloadItem.state === 'in_progress';
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
 * @param {DSBDownload} download
 * @param {SyncOptions} options
 * @returns {boolean}
 */
export function shouldHideDownload(download: DSBDownload, options: SyncOptions): boolean {
    const downloadItem = download.downloadItem;
    const extension = _.last(downloadItem.filename.match(/\.(.*)/));

    if (!options.autohideEnable) {
        return false;
    }

    // Does the download match one of the selected file types
    const match = _.find(options.autohideFileTypes, (fileType) => {
        return fileType.mimes.indexOf(downloadItem.mime) !== -1 || (extension && fileType.extensions.indexOf(extension) !== -1);
    });

    // Hide it if there was a match
    if (match) {
        return true;
    }

    // Hide it the mime or extension matches one of the custom types
    if (options.autohideCustomTypes.indexOf(downloadItem.mime) !== -1 || (extension && options.autohideCustomTypes.indexOf(extension) !== -1)) {
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