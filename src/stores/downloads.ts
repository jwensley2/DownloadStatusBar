import {DSBDownload} from '../DSBDownload';
import {defineStore} from 'pinia'

interface Downloads {
    downloads: Array<DSBDownload>
}

export const useDownloadsStore = defineStore('main', {
    state: (): Downloads => ({
        downloads: [],
    }),

    getters: {
        downloadForId: (state) => (id: number): DSBDownload | undefined => {
            return state.downloads.find(download => download.downloadItem.id === id) as DSBDownload | undefined;
        },
    },

    actions: {
        setDownloads(downloads: DSBDownload[]) {
            this.downloads = downloads;
        },
    },
});