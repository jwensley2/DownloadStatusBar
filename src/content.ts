import Vue, {VNode} from "vue";
import * as helpers from "./helpers";
import ContextMenuPlugin from "./context-menu/ContextMenuPlugin";
import Tooltip from "./tooltip/Tooltip";
import DownloadStatusBarComponent from "./components/DownloadStatusBar.vue";
import {DownloadInterface, DSBDownload} from "./DSBDownload";

class DownloadStatusBar {
    private app: Vue;
    protected _downloads: DSBDownload[] = [];
    protected statusBar: HTMLElement = DownloadStatusBar.makeStatusBarElement();

    constructor() {
        if (document.getElementById("DownloadStatusBarContainer")) {
            this.statusBar = document.getElementById("DownloadStatusBarContainer")!;
        } else {
            document.body.appendChild(this.statusBar);
        }

        Vue.use(ContextMenuPlugin);
        Vue.use(Tooltip);

        let app = this.app = new Vue({
            el: "#DownloadStatusBarContainer",
            data: {
                downloads: [],
            },
            render(render): VNode {
                return render(DownloadStatusBarComponent, {
                    props: {
                        downloads: this.downloads,
                    },
                });
            },
        });

        app.$on("clearDownloads", () => {
            // Clear the locally stored downloads
            this.downloads = helpers.filterFinishedDownloads(this._downloads);

            // Tell the background to clear it's downloads
            browser.runtime.sendMessage({event: "clearDownloads"});

            // Close the context menu
            this.app.$contextMenu.close();
        });

        app.$on("clearDownload", (download: DSBDownload) => {
            // Filter out the cleared download
            this.downloads = helpers.removeSelectedDownload(download.downloadItem, this._downloads);

            // Tell the background process to clear the download
            browser.runtime.sendMessage({event: "clearDownload", download: JSON.stringify(download)});
        });

        app.$on("showDownload", (download: DSBDownload) => {
            // Tell the background process to open the download
            browser.runtime.sendMessage({event: "showDownload", download: JSON.stringify(download)});
        });

        app.$on("cancelDownload", (download: DSBDownload) => {
            browser.runtime.sendMessage({event: "cancelDownload", download: JSON.stringify(download)});
        });

        app.$on("pauseDownload", (download: DSBDownload) => {
            browser.runtime.sendMessage({event: "pauseDownload", download: JSON.stringify(download)});
        });

        app.$on("resumeDownload", (download: DSBDownload) => {
            browser.runtime.sendMessage({event: "resumeDownload", download: JSON.stringify(download)});
        });

        app.$on("deleteDownload", (download: DSBDownload) => {
            browser.runtime.sendMessage({event: "deleteDownload", download: JSON.stringify(download)});
        });

        app.$on("openOptions", () => {
            browser.runtime.sendMessage({event: "openOptions"});
        });
    }

    set downloads(downloads: DSBDownload[]) {
        this._downloads = downloads;
        this.app.$data["downloads"] = downloads;
    }

    private static makeStatusBarElement(): HTMLElement {
        let container = document.createElement("div");

        container.id = "DownloadStatusBarContainer";

        return container;
    }
}

let statusBar = new DownloadStatusBar();

browser.runtime.onMessage.addListener((json: any) => {
    let downloads: DownloadInterface[] = JSON.parse(json);

    statusBar.downloads = downloads.map((downloadItem) => {
        return DSBDownload.fromJson(downloadItem);
    });
});
