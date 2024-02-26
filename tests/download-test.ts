import tape from 'tape';
import {DSBDownload} from '../src/DSBDownload';
import moment from 'moment';
import * as utils from './utils';

tape('download speed', (t) => {
    const now = moment();
    let downloadItem = utils.makeDownloadItem();

    downloadItem.startTime = now.toISOString();

    const download = new DSBDownload(downloadItem);

    t.plan(3);

    // Add 200 bytes over 1 second
    downloadItem.bytesReceived = 200;
    download.updateDownload(downloadItem, now.clone().add(1, 's'));
    t.is(download.calculateDownloadSpeed(), 200, 'download speed should be 200');

    // Add 200 bytes over 1 second
    downloadItem.bytesReceived = 400;
    download.updateDownload(downloadItem, now.clone().add(2, 's'));
    t.is(download.calculateDownloadSpeed(), 200, 'download speed should be 200');

    // Add 800 bytes over 1 second
    downloadItem.bytesReceived = 1200;
    download.updateDownload(downloadItem, now.clone().add(3, 's'));
    t.is(download.calculateDownloadSpeed(), 400, 'download speed should be 400');
});

tape('filename', (t) => {
    const windowsPath = new DSBDownload(utils.makeDownloadItem());
    const unixPath = new DSBDownload(utils.makeDownloadItem({filename: '/home/tester/myfile.txt'}));

    t.plan(2);

    t.equal(windowsPath.filename(), 'myfile.txt', 'Windows filename is myfile.txt');
    t.equal(unixPath.filename(), 'myfile.txt', 'Unix filename is myfile.txt');
});

tape('cancelled', (t) => {
    const download = new DSBDownload(utils.makeDownloadItem());
    const cancelledDownload = new DSBDownload(utils.makeDownloadItem({state: 'interrupted', error: 'USER_CANCELED'}));
    const pausedDownload = new DSBDownload(utils.makeDownloadItem({state: 'interrupted', paused: true}));

    t.plan(3);

    t.equal(download.isCancelled(), false, 'not cancelled');
    t.equal(cancelledDownload.isCancelled(), true, 'is cancelled');
    t.equal(pausedDownload.isCancelled(), false, 'paused is not cancelled');
});

tape('is image', (t) => {
    const imageMimetype = new DSBDownload(utils.makeDownloadItem({mime: 'image/png'}));
    const imageExtension = new DSBDownload(utils.makeDownloadItem({mime: '', filename: 'testimage.png'}));
    const nonImage = new DSBDownload(utils.makeDownloadItem());
    const noMimeOrExtension = new DSBDownload(utils.makeDownloadItem({mime: '', filename: 'testfile'}));

    t.plan(4);

    t.equal(imageMimetype.isImage(), true, 'image with an image mimetype');
    t.equal(imageExtension.isImage(), true, 'image with an image file extension');
    t.equal(nonImage.isImage(), false, 'non image');
    t.equal(noMimeOrExtension.isImage(), false, 'non image without a mimetype or extension');
});

tape('percent downloaded', (t) => {
    const download = new DSBDownload(utils.makeDownloadItem({totalBytes: 1000}));

    t.plan(5);

    t.equal(download.percentDownloaded(), 0, '0% downloaded');

    download.downloadItem.bytesReceived = 500;
    t.equal(download.percentDownloaded(), 50, '50% downloaded');

    download.downloadItem.bytesReceived = 1000;
    t.equal(download.percentDownloaded(), 100, '100% downloaded');

    download.downloadItem.totalBytes = -1;
    t.equal(download.percentDownloaded(), 0, 'Unknown size is 0%');

    download.downloadItem.state = 'complete';
    t.equal(download.percentDownloaded(), 100, 'complete download is 100%');
});
