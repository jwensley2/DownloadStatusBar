import {reactive, ref, watch} from 'vue';
import {defineStore} from 'pinia'
import _ from 'lodash';
import {defaultLocalOptions, LocalOptions} from '@/config/options';
import ChangeDict = browser.storage.ChangeDict;
import StorageName = browser.storage.StorageName;
import StorageObject = browser.storage.StorageObject;
import {forceUnref} from '@/helpers/forceUnref';
import {mergeSyncDefaultOptions} from '@/helpers/options';

export const useLocalOptionsStore = defineStore('localOptions', () => {
    const options: LocalOptions = reactive(defaultLocalOptions());

    const loaded = ref(new Promise<void>((resolve): void => {
        browser.storage.local.get(null)
            .then((localOptions: StorageObject) => {
                Object.assign(options, mergeSyncDefaultOptions(forceUnref(localOptions)));
                resolve();
            });
    }));

    function onChanged(changedOptions: ChangeDict, areaName: StorageName) {
        if (areaName === 'local') {
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
            browser.storage.local.set(copy).then(() => {
                browser.storage.onChanged.addListener(onChanged);
            });
        },
        reset() {
            Object.assign(options, defaultLocalOptions());
        },
    };
});