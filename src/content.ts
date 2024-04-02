import DownloadStatusBar from '@/DownloadStatusBar';
import {DSBDownload, SerializedDownloadInterface} from '@/DSBDownload';

const statusBar = new DownloadStatusBar();
statusBar.listen();


// Listen for messages from background script
browser.runtime.onMessage.addListener((request) => {
    if ('event' in request && request.event === 'updateDownloads' && Array.isArray(request.downloads)) {
        const downloads = request.downloads as SerializedDownloadInterface[];

        statusBar.downloads = downloads.map((downloadItem) => {
            return DSBDownload.fromJson(downloadItem);
        });
    }
});
