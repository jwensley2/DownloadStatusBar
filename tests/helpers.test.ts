import * as helpers from '../src/helpers';
import * as utils from './utils';
import {DSBDownload} from '../src/DSBDownload';
import {defaultSyncOptions} from '../src/config/options';
import fileTypes from '../src/config/filetypes';

describe('test shouldHideDownload', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const hidePNGs = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideFileTypes: [{name: 'PNG', mimes: ['image/png'], extensions: ['png']}],
    });

    const hidePNGsCustomExtension = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ['png'],
    });

    const hidePNGsCustomMime = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ['image/png'],
    });

    test('file should not be hidden with default options', () => {
        expect(helpers.shouldHideDownload(download, defaultSyncOptions)).toBe(false);
    });

    test('png filetype should be hidden', () => {
        expect(helpers.shouldHideDownload(download, hidePNGs)).toBe(true);
    });

    test('png extension should be hidden', () => {
        expect(helpers.shouldHideDownload(download, hidePNGsCustomExtension)).toBe(true);
    });

    test('png mime should be hidden', () => {
        expect(helpers.shouldHideDownload(download, hidePNGsCustomMime)).toBe(true);
    });
});

describe('test shouldIgnoreDownload', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const ignorePNGs = helpers.mergeSyncDefaultOptions({
        ignoredFileTypes: [{name: 'PNG', mimes: ['image/png'], extensions: ['png']}],
    });

    const ignorePNGsCustomExtension = helpers.mergeSyncDefaultOptions({
        ignoredCustomTypes: ['png'],
    });

    const ignorePNGsCustomMime = helpers.mergeSyncDefaultOptions({
        ignoredCustomTypes: ['image/png'],
    });

    test('file should not be ignored with default options', () => {
        expect(helpers.shouldIgnoreDownload(download, defaultSyncOptions)).toBe(false);
    });

    test('png filetype should be ignored', () => {
        expect(helpers.shouldIgnoreDownload(download, ignorePNGs)).toBe(true);
    });

    test('png extension should be ignored', () => {
        expect(helpers.shouldIgnoreDownload(download, ignorePNGsCustomExtension)).toBe(true);
    });

    test('png mime should be ignored', () => {
        expect(helpers.shouldIgnoreDownload(download, ignorePNGsCustomMime)).toBe(true);
    });
});

describe('test downloadMatchesFiletypes', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const imageFiletypes = fileTypes['Images'];
    const documentsFiletypes = fileTypes['Documents'];

    test('image download should match image file types', () => {
        expect(helpers.downloadMatchesFiletypes(download, imageFiletypes)).toBe(true)
    });

    test('image download should not match document filetypes', () => {
        expect(helpers.downloadMatchesFiletypes(download, documentsFiletypes)).toBe(false)
    });
});

describe('test downloadMatchesCustomTypes', () => {
    const downloads = [
        new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'})),
        new DSBDownload(utils.makeDownloadItem({filename: 'test.test.png', mime: 'image/png'})),
        new DSBDownload(utils.makeDownloadItem({filename: 'test-test.png', mime: 'image/png'}))
    ];

    const imageExtensions = ['png', 'jpg'];
    const imageMimetypes = ['image/png', 'image/jpeg'];
    const textExtensions = ['txt', 'doc'];
    const textMimetypes = ['text/plain'];
    const patterns = ['*test.png'];

    for (let download of downloads) {
        const filename = download.downloadItem.filename;

        describe(filename, () => {
            test('image download should match image file types', () => {
                expect(helpers.downloadMatchesCustomTypes(download, imageExtensions)).toBe(true)
            });

            test('image download should match image file types', () => {
                expect(helpers.downloadMatchesCustomTypes(download, imageMimetypes)).toBe(true)
            });

            test('image download should not match document filetypes', () => {
                expect(helpers.downloadMatchesCustomTypes(download, textExtensions)).toBe(false)
            });

            test('image download should not match document filetypes', () => {
                expect(helpers.downloadMatchesCustomTypes(download, textMimetypes)).toBe(false)
            });

            test('image download should match pattern', () => {
                expect(helpers.downloadMatchesCustomTypes(download, patterns)).toBe(true)
            });
        });
    }
});

test('test formatFileSize', () => {
    const kb = 1024;
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    const tb = 1024 * 1024 * 1024 * 1024;

    expect(helpers.formatFileSize(1)).toBe('1B');
    expect(helpers.formatFileSize(kb * 1.5)).toBe('1.5KB');
    expect(helpers.formatFileSize(kb)).toBe('1KB');
    expect(helpers.formatFileSize(mb)).toBe('1MB');
    expect(helpers.formatFileSize(gb)).toBe('1GB');
    expect(helpers.formatFileSize(tb)).toBe('1TB');
});

test('test getFileTypeByName', () => {
    expect(helpers.getFileTypeByName('PNG')).toBe(fileTypes.Images[0]);
});