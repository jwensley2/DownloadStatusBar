import {DownloadInterface, DSBDownload} from '@/DSBDownload';
import DownloadStatusBar from '@/DownloadStatusBar';
import {stat} from 'copy-webpack-plugin/types/utils';

const statusBar = new DownloadStatusBar();
statusBar.listen();

browser.runtime.onMessage.addListener((json: any) => {
    let downloads: DownloadInterface[] = JSON.parse(json);

    statusBar.downloads = downloads.map((downloadItem) => {
        return DSBDownload.fromJson(downloadItem);
    });
});