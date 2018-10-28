import DownloadItem = browser.downloads.DownloadItem;
import moment = require("moment");

export function makeDownloadItem(downloadItem?: Partial<DownloadItem>): DownloadItem {
    let defaults = {
        id: 0,
        url: "https://test.com/myfile.txt",
        referrer: "https://test.com/",
        filename: "C:\\Users\\Test\\Downloads\\myfile.txt",
        incognito: false,
        danger: "",
        mime: "text/plain",
        startTime: moment().toISOString(),
        endTime: undefined,
        estimatedEndTime: null,
        state: "in_progress",
        paused: false,
        canResume: false,
        error: null,
        bytesReceived: 0,
        totalBytes: 100000,
        fileSize: 100000,
        exists: true,
        byExtensionId: undefined,
        byExtensionName: undefined,
    };

    return Object.assign({}, defaults, downloadItem);
}
