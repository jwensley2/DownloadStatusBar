import {defineStore} from 'pinia'
import {defaultLocalOptions, defaultSyncOptions, LocalOptions, SyncOptions} from '@/config/options';
import * as helpers from '@/helpers';
import {forceUnref} from '@/helpers';
import _ from 'lodash';

interface Options {
    syncOptions: SyncOptions,
    localOptions: LocalOptions
}

export const useOptionsStore = defineStore('options', {
    state: (): Options => ({
        syncOptions: defaultSyncOptions,
        localOptions: defaultLocalOptions
    }),

    actions: {
        /**
         * Load the sync options from the browser
         */
        async loadSyncOptions(): Promise<SyncOptions> {
            let options = forceUnref(await browser.storage.sync.get(null));
            this.syncOptions = helpers.mergeSyncDefaultOptions(options);

            return this.syncOptions;
        },

        /**
         * Save the sync options to the browser
         * @param options
         */
        async saveSyncOptions(options: SyncOptions): Promise<void> {
            options = _.cloneDeep(forceUnref(options));

            return browser.storage.sync.set(options);
        },

        /**
         * Load the local options from the browser
         */
        async loadLocalOptions(): Promise<LocalOptions> {
            let options = forceUnref(await browser.storage.local.get(null));
            this.localOptions = helpers.mergeLocalDefaultOptions(options);

            return this.localOptions;
        },

        /**
         * Save the local options to the browser
         * @param options
         */
        async saveLocalOptions(options: LocalOptions): Promise<void> {
            options = _.cloneDeep(forceUnref(options));

            this.localOptions = options;

            return browser.storage.local.set(options);
        },

        /**
         * Remove a local option by key
         * @param keys
         */
        async removeLocalOption(keys: string | string[]): Promise<LocalOptions> {
            return browser.storage.local.remove(keys).then(() => {
                return this.loadLocalOptions(); // reload state
            });
        }
    },
});