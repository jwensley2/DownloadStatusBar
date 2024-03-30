import {reactive, ref, watch} from 'vue';
import {defineStore} from 'pinia'
import _ from 'lodash';
import {defaultSyncOptions, SyncOptions} from '@/config/options';
import {forceUnref, mergeSyncDefaultOptions} from '@/helpers';
import ChangeDict = browser.storage.ChangeDict;
import StorageName = browser.storage.StorageName;
import StorageObject = browser.storage.StorageObject;

export const useSyncOptionsStore = defineStore('syncOptions', () => {
    const options: SyncOptions = reactive(defaultSyncOptions());

    const loaded = ref(new Promise<void>((resolve): void => {
        browser.storage.sync.get(null)
            .then((syncOptions: StorageObject) => {
                Object.assign(options, mergeSyncDefaultOptions(forceUnref(syncOptions)));
                resolve();
            });
    }));

    function onChanged(changedOptions: ChangeDict, areaName: StorageName) {
        if (areaName === 'sync') {
            let newValues = _.mapValues(changedOptions, (item) => {
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
            browser.storage.sync.set(copy).then(() => {
                browser.storage.onChanged.addListener(onChanged);
            });
        },
        reset() {
            Object.assign(options, defaultSyncOptions());
        },
    };
});