import {defaultSyncOptions, SyncOptions} from '@/config/options';
import {createOptionsStore, mergeSyncDefaultOptions} from '@/helpers/options';

export const useSyncOptionsStore = createOptionsStore<SyncOptions>('sync', defaultSyncOptions(), mergeSyncDefaultOptions);