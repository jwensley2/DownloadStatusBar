import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from '@/config/options';
import {getFileTypeByName} from '@/helpers/getFileTypeByName';

/**
 * Merge the default local options into a local options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export function mergeLocalDefaultOptions(options: Partial<LocalOptions>): LocalOptions {
    return Object.assign({}, defaultLocalOptions(), options);
}

/**
 * Merge the default sync options into a sync options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export function mergeSyncDefaultOptions(options: Partial<SyncOptions>): SyncOptions {
    let merged = Object.assign({}, defaultSyncOptions(), options);

    // Replace the saved types with the one in the config if it exists
    merged.autohideFileTypes = merged.autohideFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    merged.ignoredFileTypes = merged.ignoredFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    return merged;
}