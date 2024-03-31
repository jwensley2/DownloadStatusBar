import DownloadStatus from '@/DownloadStatus';

const downloadStatus = new DownloadStatus();
downloadStatus.listen();

// Auto open options during development
if (__DEV_MODE__) {
    browser.runtime.openOptionsPage();
}