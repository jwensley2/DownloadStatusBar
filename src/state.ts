import {DSBDownload} from './DSBDownload';
import {StoreOptions} from 'vuex';

export interface DSBState {
    downloads: Array<DSBDownload>
}

export const storeOptions: StoreOptions<DSBState> = {
    state: {
        downloads: [],
    },

    getters: {
        getDownloads: (state) => state.downloads,
        getDownload: (state, id) => (id: number) => {
            return state.downloads.find(download => download.downloadItem.id === id);
        },
    },

    mutations: {
        setDownloads: (state, downloads) => {
            state.downloads = downloads;
        },
    },
};