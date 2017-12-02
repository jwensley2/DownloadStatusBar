import DownloadItem = browser.downloads.DownloadItem;
import {defaultOptions, Options} from './config/options';
import fileTypes, {FileType} from './config/filetypes';
import * as _ from 'lodash';

/**
 * Remove completed downloads from the array of downloads
 *
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function filterCompletedDownloads(downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (download: DownloadItem) {
        return download.state !== 'complete';
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