import Vue from 'vue';
import DownloadStatusBarComponent from './components/DownloadStatusBar.vue';
import DownloadComponent from './components/Download.vue';
import './content.scss';
import {AnyVue} from "vue/types/vue";

class DownloadStatusBar {
    private app: AnyVue;
    protected statusBar: HTMLElement = document.createElement('div');

    constructor() {
        if (document.getElementById("DownloadStatusBarContainer")) {
            this.statusBar = document.getElementById("DownloadStatusBarContainer")!;
        } else {
            this.statusBar.id = "DownloadStatusBarContainer";
            this.statusBar.innerHTML = `<download-status-bar :downloads="downloads"></download-status-bar>`;
            document.body.appendChild(this.statusBar);
        }

        Vue.component('download-status-bar', DownloadStatusBarComponent);
        Vue.component('download', DownloadComponent);

        this.app = new Vue({
            el: "#DownloadStatusBarContainer",
            data: {downloads: []}
        });

        this.app.$on('clearDownloads', () => {
            // Clear the locally stored downloads
            this.downloads = [];
            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});
        });

        this.app.$on('openDownload', (download: DownloadItem) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'openDownload', download: download});
        });
    }

    set downloads(downloads: DownloadItem[]) {
        this.app.$data.downloads = downloads;
    }

    getFilename(url: string): string {
        let m = url.toString().match(/.*[\/\\](.+)/);

        if (m && m.length > 1) {
            return m[m.length - 1];
        }

        return '';
    }

    formatFilesize(bytes: number) {
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        let i = Math.floor(Math.log(bytes) / Math.log(1024));

        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener(function (downloads: DownloadItem[]) {
    statusBar.downloads = downloads;
});