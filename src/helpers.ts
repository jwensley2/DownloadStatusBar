import DownloadItem = browser.downloads.DownloadItem;

/**
 * Remove completed downloads from the array of downloads
 *
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function filterCompletedDownloads(downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (download: DownloadItem) {
        return download.state !== 'complete';
    })
}

/**
 * Remove the passed download from the array of downloads
 *
 * @param {browser.downloads.DownloadItem} download
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function removeSelectedDownload(download: DownloadItem, downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (dl: DownloadItem) {
        return dl.id !== download.id;
    })
}

/**
 * Get in progress downloads
 *
 * @param {browser.downloads.DownloadItem[]} downloads
 * @returns {browser.downloads.DownloadItem[]}
 */
export function getInProgressDownloads(downloads: DownloadItem[]): DownloadItem[] {
    return downloads.filter(function (dl: DownloadItem) {
        return dl.state === 'in_progress';
    })
}