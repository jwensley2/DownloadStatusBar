import Vue from 'vue';
import ContextMenu from './vue/context-menu/ContextMenu';
import DownloadStatusBarComponent from './vue/components/DownloadStatusBar.vue';
import DownloadComponent from './vue/components/Download.vue';
import './content.scss';

class DownloadStatusBar {
    private app: Vue;
    protected statusBar: HTMLElement = document.createElement('div');

    constructor() {
        if (document.getElementById("DownloadStatusBarContainer")) {
            this.statusBar = document.getElementById("DownloadStatusBarContainer")!;
        } else {
            this.statusBar.id = "DownloadStatusBarContainer";
            this.statusBar.setAttribute('v-on:mouseleave', "hideContextMenu");
            this.statusBar.innerHTML = `
                <download-status-bar :downloads="downloads"></download-status-bar>
                <context-menu></context-menu>
            `;
            document.body.appendChild(this.statusBar);
        }

        Vue.use(ContextMenu);
        Vue.component(DownloadStatusBarComponent.name, DownloadStatusBarComponent);
        Vue.component(DownloadComponent.name, DownloadComponent);

        this.app = new Vue({
            el: "#DownloadStatusBarContainer",
            data: {
                downloads: [],
            },
            methods: {
                hideContextMenu() {
                    this.$contextMenu.close();
                }
            }
        });

        this.app.$on('clearDownloads', () => {
            // Clear the locally stored downloads
            this.downloads = [];
            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: 'clearDownloads'});
            this.app.$contextMenu.close();
        });

        this.app.$on('clearDownload', (download: DownloadItem) => {
            this.downloads = this.app.$data['downloads'].filter(function (dl: DownloadItem) {
                return dl.id !== download.id;
            });

            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: 'clearDownload', download: download});
        });

        this.app.$on('showDownload', (download: DownloadItem) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: 'showDownload', download: download});
        });
    }

    set downloads(downloads: DownloadItem[]) {
        this.app.$data['downloads'] = downloads;
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener(function (downloads: DownloadItem[]) {
    statusBar.downloads = downloads;
});