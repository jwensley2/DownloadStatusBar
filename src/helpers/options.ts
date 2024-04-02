import {reactive, ref, UnwrapNestedRefs} from 'vue';
import {defineStore} from 'pinia';
import _ from 'lodash';
import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from '@/config/options';
import {getFileTypeByName} from '@/helpers/getFileTypeByName';
import {forceUnref} from '@/helpers/forceUnref';
import StorageName = browser.storage.StorageName;
import StorageObject = browser.storage.StorageObject;
import ChangeDict = browser.storage.ChangeDict;

export type AnyOptions = LocalOptions | SyncOptions;
export type MergeFunction<T extends AnyOptions> = (options: Partial<T>) => T;

/**
 * Merge the default local options into a local options object
 *
 * @param {LocalOptions} options
 * @returns {LocalOptions}
 */
export const mergeLocalDefaultOptions: MergeFunction<LocalOptions> = (options: Partial<LocalOptions>): LocalOptions => {
    return Object.assign({}, defaultLocalOptions(), options);
};

/**
 * Merge the default sync options into a sync options object
 *
 * @param {SyncOptions} options
 * @returns {SyncOptions}
 */
export const mergeSyncDefaultOptions: MergeFunction<SyncOptions> = (options: Partial<SyncOptions>): SyncOptions => {
    const merged = Object.assign({}, defaultSyncOptions(), options);

    // Replace the saved types with the one in the config if it exists
    merged.autohideFileTypes = merged.autohideFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    merged.ignoredFileTypes = merged.ignoredFileTypes.map((fileType) => {
        return getFileTypeByName(fileType.name) || fileType;
    });

    return merged;
};

/**
 * Create an options store for the specified area
 *
 * @param area The storage area
 * @param defaultOptions The default options
 * @param mergeFunction The function to use for merging in the default options
 */
export function createOptionsStore<T extends AnyOptions>(area: StorageName, defaultOptions: T, mergeFunction: MergeFunction<T>) {
    return defineStore(`${area}Options`, () => {
        const options: UnwrapNestedRefs<T> = reactive(defaultOptions);

        const loaded = ref(new Promise<void>((resolve): void => {
            browser.storage[area].get(null)
                .then((storedOptions: StorageObject) => {
                    Object.assign(options, mergeFunction(forceUnref(storedOptions as Partial<T>)));
                    resolve();
                });
        }));

        function onChanged(changedOptions: ChangeDict, areaName: StorageName) {
            if (areaName === area) {
                const newValues = _.mapValues(changedOptions, (item) => {
                    return item.newValue;
                });

                Object.assign(options, newValues);
            }
        }

        browser.storage.onChanged.addListener(onChanged);

        return {
            options,
            loaded,
            save() {
                const copy = _.cloneDeep(forceUnref(options));

                browser.storage.onChanged.removeListener(onChanged);
                browser.storage[area].set(copy).then(() => {
                    browser.storage.onChanged.addListener(onChanged);
                });
            },
            reset() {
                Object.assign(options, defaultOptions);
            },
        };
    });
}
