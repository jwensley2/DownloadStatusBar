import {DSBDownload} from '@/DSBDownload';
import moment from 'moment';
import * as utils from './utils';
import DownloadItem = browser.downloads.DownloadItem;

test('test download speed', () => {
    const now = moment();
    let downloadItem = utils.makeDownloadItem();

    downloadItem.startTime = now.toISOString();

    const download = new DSBDownload(downloadItem);

    expect.assertions(3);

    // Add 200 bytes over 1 second
    downloadItem.bytesReceived = 200;
    download.updateDownload(downloadItem, now.clone().add(1, 's'));
    expect(download.calculateDownloadSpeed()).toBe(200);

    // Add 200 bytes over 1 second
    downloadItem.bytesReceived = 400;
    download.updateDownload(downloadItem, now.clone().add(2, 's'));
    expect(download.calculateDownloadSpeed()).toBe(200);

    // Add 800 bytes over 1 second
    downloadItem.bytesReceived = 1200;
    download.updateDownload(downloadItem, now.clone().add(3, 's'));
    expect(download.calculateDownloadSpeed()).toBe(400);
});

test('test filename', () => {
    const windowsPath = new DSBDownload(utils.makeDownloadItem());
    const unixPath = new DSBDownload(utils.makeDownloadItem({filename: '/home/tester/myfile.txt'}));

    expect.assertions(2);

    expect(windowsPath.filename()).toBe('myfile.txt');
    expect(unixPath.filename()).toBe('myfile.txt');
});

test('test cancelled', () => {
    const download = new DSBDownload(utils.makeDownloadItem());
    const cancelledDownload = new DSBDownload(utils.makeDownloadItem({state: 'interrupted', error: 'USER_CANCELED'}));
    const pausedDownload = new DSBDownload(utils.makeDownloadItem({state: 'interrupted', paused: true}));

    expect.assertions(3);

    expect(download.isCancelled()).toBe(false);
    expect(cancelledDownload.isCancelled()).toBe(true);
    expect(pausedDownload.isCancelled()).toBe(false);
});

test('test is image', () => {
    const imageMimetype = new DSBDownload(utils.makeDownloadItem({mime: 'image/png'}));
    const imageExtension = new DSBDownload(utils.makeDownloadItem({mime: '', filename: 'testimage.png'}));
    const nonImage = new DSBDownload(utils.makeDownloadItem());
    const noMimeOrExtension = new DSBDownload(utils.makeDownloadItem({mime: '', filename: 'testfile'}));

    expect.assertions(4);

    expect(imageMimetype.isImage()).toBe(true);
    expect(imageExtension.isImage()).toBe(true);
    expect(nonImage.isImage()).toBe(false);
    expect(noMimeOrExtension.isImage()).toBe(false);
});

test('test percent downloaded', () => {
    const download = new DSBDownload(utils.makeDownloadItem({totalBytes: 1000}));

    expect.assertions(5);

    expect(download.percentDownloaded()).toBe(0);

    download.downloadItem.bytesReceived = 500;
    expect(download.percentDownloaded()).toBe(50);

    download.downloadItem.bytesReceived = 1000;
    expect(download.percentDownloaded()).toBe(100);

    download.downloadItem.totalBytes = -1;
    expect(download.percentDownloaded()).toBe(0);

    download.downloadItem.state = 'complete';
    expect(download.percentDownloaded()).toBe(100);
});

const downloadStatuses: { name: string; status: string; state: Partial<DownloadItem> }[] = [
    {
        name: 'complete',
        state: {state: 'complete'},
        status: 'downloadStatusComplete',
    },
    {
        name: 'paused',
        state: {state: 'in_progress', paused: true},
        status: 'downloadStatusPaused',
    },
    {
        name: 'cancelled',
        state: {state: 'interrupted', paused: false, error: 'USER_CANCELED'},
        status: 'downloadStatusCancelled',
    },
    {
        name: 'error',
        state: {state: 'interrupted', error: 'SOME ERROR'},
        status: 'downloadStatusError: SOME ERROR',
    },
    {
        name: 'in progress',
        state: {state: 'in_progress', totalBytes: -1},
        status: 'downloadStatusInProgress',
    },
];

describe.each(downloadStatuses)('test download status', (status) => {
    test(`test ${status.name}`, () => {
        const download = new DSBDownload(utils.makeDownloadItem(status.state));
        expect(download.status()).toBe(status.status);
    });
});

test('test download progress', () => {
    const download = new DSBDownload(utils.makeDownloadItem({totalBytes: 1024, fileSize: 1024}));

    expect(download.progress()).toBe('0B / 1KB - 0%');

    download.downloadItem.bytesReceived = 512;
    expect(download.progress()).toBe('512B / 1KB - 50%');

    download.downloadItem.bytesReceived = 1024;
    expect(download.progress()).toBe('1KB / 1KB - 100%');

    download.downloadItem.totalBytes = -1;
    expect(download.progress()).toBe('1KB / Unknown');

    download.downloadItem.state = 'complete';
    expect(download.progress()).toBe('1KB');
});