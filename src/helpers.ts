import _ from 'lodash';
import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from '@/config/options';
import fileTypes, {FileType} from '@/config/filetypes';
import {DSBDownload} from '@/DSBDownload';
import {defaultThemes, lightTheme, Theme} from '@/config/themes';
import * as mm from 'micromatch';

/**
 * Remove finished downloads from the array of downloads
 *
 * @param {DSBDownload[]} downloads
 * @param {boolean} removeFailed
 * @returns {DSBDownload[]}
 */
export function filterFinishedDownloads(downloads: DSBDownload[], removeFailed: boolean = false): DSBDownload[] {
    return downloads.filter(function (download: DSBDownload) {
        const downloadItem = download.downloadItem;

        if (downloadItem.error && !downloadItem.paused && !removeFailed) {
            return false;
        }

        return downloadItem.state === 'in_progress' || downloadItem.paused;
    });
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
 * Merge the default sync options into a sync options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export function mergeSyncDefaultOptions(options: Partial<SyncOptions>): SyncOptions {
    let merged = Object.assign({}, defaultSyncOptions, options);

    // Replace the saved types with the one in the config if it exists
    merged.autohideFileTypes = merged.autohideFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    merged.ignoredFileTypes = merged.ignoredFileTypes.map((fileType) => {
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
 * @param {DSBDownload} download
 * @param {SyncOptions} options
 * @returns {boolean}
 */
export function shouldIgnoreDownload(download: DSBDownload, options: SyncOptions): boolean {
    // Ignore it if there was a match
    if (downloadMatchesFiletypes(download, options.ignoredFileTypes)) {
        return true;
    }

    // Ignore it the mime or extension matches one of the custom types
    return downloadMatchesCustomTypes(download, options.ignoredCustomTypes);
}

/**
 * Check if the download matches the list of types
 *
 * @param {DSBDownload} download
 * @param {FileType[]} fileTypes
 * @returns {boolean}
 */
export function downloadMatchesFiletypes(download: DSBDownload, fileTypes: FileType[]): boolean {
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
 * Check of the download matches the list of custom types
 *
 * @param {DSBDownload} download
 * @param {string[]} types
 * @returns {boolean}
 */
export function downloadMatchesCustomTypes(download: DSBDownload, types: string[]): boolean {
    const downloadItem = download.downloadItem;
    const extension = _.last(downloadItem.filename.match(/\.([^.]*)$/));
    const filename = downloadItem.filename.replace(/\\/g, '/'); // Normalize to Unix style path

    return types.indexOf(downloadItem.mime) !== -1
        || (!!extension && types.indexOf(extension) !== -1)
        || mm.any(filename, types, {matchBase: true});
}

/**
 * Format a filesize in bytes to KB, MB, GB or TB
 *
 * @param {number} bytes
 * @param round
 * @returns {string}
 */
export function formatFileSize(bytes: number, round: boolean = false) {
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes <= 0) return '0B';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));

    let size = Math.round(bytes / Math.pow(1024, i) * 100) / 100;

    if (round) {
        size = Math.round(size);
    }

    return size + sizes[i];
}

/**
 * Save the options to the synced storage
 * @param {SyncOptions} options
 */
export function saveOptionsToStorage(options: SyncOptions) {
    options = {...options};

    return browser.storage.sync.set(options);
}

/**
 * Localize a string
 * @returns {string}
 */
export function localize(messageName: string, substitutions?: string | string[]): string {
    return browser.i18n.getMessage(messageName, substitutions);
}

/**
 * Find the theme matching the provided theme id
 * @param {string} id
 * @param {Theme} customThemes
 */
export function getThemeById(id: string, customThemes: Theme[] = []): Theme {
    for (let theme of defaultThemes) {
        if (theme.id === id) {
            return theme;
        }
    }

    for (let customTheme of customThemes) {
        if (customTheme.id === id) {
            return Object.assign(customTheme, Object.assign({}, lightTheme, customTheme));
        }
    }

    return lightTheme;
}

/**
 * Generate a random string
 */
export function randomString(length: number) {
    const chars: string[] = [];
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++)
        chars.push(possible.charAt(Math.floor(Math.random() * possible.length)));

    return chars.join('');
}

/**
 * Force removal of ref properties, unref doesn't seem to work in some cases
 *
 * @param obj
 */
export function forceUnref<T extends object>(obj: T): T {
    return _.omit(_.assign({}, obj), ['_value', '_rawValue', '__v_isRef', '__v_isShallow']) as T;
}