import moment from 'moment';
import _ from 'lodash';
import {DownloadInterface, DSBDownload} from '@/DSBDownload';
import {FileType} from '@/config/filetypes';
import {SyncOptions} from '@/config/options';
import * as mm from 'micromatch';
import DownloadItem = browser.downloads.DownloadItem;

/**
 * Check if the download matches the list of types
 *
 * @param {DownloadInterface} download
 * @param {FileType[]} fileTypes
 * @returns {boolean}
 */
export function downloadMatchesFiletypes(download: DownloadInterface, fileTypes: FileType[]): boolean {
    const downloadItem = download.downloadItem;
    const extension = _.last(downloadItem.filename.match(/\.(.*)/));

    // Does the download match one of the selected file types
    const match = _.find(fileTypes, (fileType) => {
        if (fileType.mimes && fileType.mimes.indexOf(downloadItem.mime) !== -1) {
            return true;
        }

        if (extension && fileType.extensions && fileType.extensions.indexOf(extension) !== -1) {
            return true;
        }

        return false;
    });

    return !!match;
}

/**
 * Remove finished downloads from the array of downloads
 *
 * @param {DownloadInterface[]} downloads
 * @param {boolean} removeFailed
 * @returns {DownloadInterface[]}
 */
export function filterFinishedDownloads<T extends DownloadInterface>(downloads: T[], removeFailed: boolean = false): T[] {
    return downloads.filter(function (download: T) {
        const downloadItem = download.downloadItem;

        if (downloadItem.error && !downloadItem.paused && !removeFailed) {
            return false;
        }

        return downloadItem.state === 'in_progress' || downloadItem.paused;
    });
}

/**
 * Get in progress downloads
 *
 * @param {DownloadInterface[]} downloads
 * @returns {DownloadInterface[]}
 */
export function getInProgressDownloads(downloads: DownloadInterface[]): DownloadInterface[] {
    return downloads.filter(function (dl: DownloadInterface) {
        return dl.downloadItem.state === 'in_progress';
    })
}

/**
 * Remove the passed download from the array of downloads
 *
 * @param {{ id: number }} download
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function removeSelectedDownload<T extends DownloadInterface>(download: { id: number }, downloads: T[]): T[] {
    return downloads.filter(function (dl: T) {
        return dl.downloadItem.id !== download.id;
    })
}

export function makeFakeDownload(downloadInfo: Partial<DownloadItem>): DownloadInterface {
    const size = 1024 * 1024 * 1024;
    const now = moment();

    const download = new DSBDownload(Object.assign({}, {
        id: _.random(),
        url: 'https://google.com',
        referrer: 'https://google.com',
        filename: '/downloads/testingtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest.txt',
        incognito: false,
        bytesReceived: 0,
        canResume: true,
        danger: '',
        exists: true,
        fileSize: size,
        mime: 'text/plaintext',
        paused: false,
        startTime: now.toISOString(),
        state: 'in_progress',
        totalBytes: size,
    }, downloadInfo));

    download.downloadProgress.push({
        time: now,
        bytesReceived: 1024,
    });

    download.downloadProgress.push({
        time: now.clone().add(1, 'second'),
        bytesReceived: 1024 * 1000,
    });

    return download;
}

/**
 * Check of the download matches the list of custom types
 *
 * @param {DownloadInterface} download
 * @param {string[]} types
 * @returns {boolean}
 */
export function downloadMatchesCustomTypes(download: DownloadInterface, types: string[]): boolean {
    const downloadItem = download.downloadItem;
    const extension = _.last(downloadItem.filename.match(/\.([^.]*)$/));
    const filename = downloadItem.filename.replace(/\\/g, '/'); // Normalize to Unix style path

    return types.indexOf(downloadItem.mime) !== -1
        || (!!extension && types.indexOf(extension) !== -1)
        || mm.any(filename, types, {matchBase: true});
}

/**
 * Check if a download should be automatically hidden
 *
 * @param {DownloadInterface} download
 * @param {SyncOptions} options
 * @returns {boolean}
 */
export function shouldHideDownload(download: DownloadInterface, options: SyncOptions): boolean {
    if (!options.autohideEnable) {
        return false;
    }

    // Hide it if there was a match
    if (downloadMatchesFiletypes(download, options.autohideFileTypes)) {
        return true;
    }

    // Hide it the mime or extension matches one of the custom types
    if (downloadMatchesCustomTypes(download, options.autohideCustomTypes)) {
        return true;
    }

    // Hide if there are no types configured
    return options.autohideCustomTypes.length === 0 && options.autohideFileTypes.length === 0;
}

/**
 * Check if a download should be ignored
 *
 * @param {DownloadInterface} download
 * @param {SyncOptions} options
 * @returns {boolean}
 */
export function shouldIgnoreDownload(download: DownloadInterface, options: SyncOptions): boolean {
    // Ignore it if there was a match
    if (downloadMatchesFiletypes(download, options.ignoredFileTypes)) {
        return true;
    }

    // Ignore it the mime or extension matches one of the custom types
    return downloadMatchesCustomTypes(download, options.ignoredCustomTypes);
}
