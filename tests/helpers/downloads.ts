import * as utils from '../utils';
import {DSBDownload} from '@/DSBDownload';
import {defaultSyncOptions} from '@/config/options';
import {fileTypes} from '@/config/filetypes';
import {downloadMatchesCustomTypes, downloadMatchesFiletypes, makeFakeDownload, shouldHideDownload, shouldIgnoreDownload} from '@/helpers/downloads';
import {mergeSyncDefaultOptions} from '@/helpers/options';

describe('test shouldHideDownload', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const hidePNGs = mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideFileTypes: [{name: 'PNG', mimes: ['image/png'], extensions: ['png']}],
    });

    const hidePNGsCustomExtension = mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ['png'],
    });

    const hidePNGsCustomMime = mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ['image/png'],
    });

    const hideAll = mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideFileTypes: [],
        autohideCustomTypes: [],
    });

    test('file should not be hidden with default options', () => {
        expect(shouldHideDownload(download, defaultSyncOptions())).toBe(false);
    });

    test('png filetype should be hidden', () => {
        expect(shouldHideDownload(download, hidePNGs)).toBe(true);
    });

    test('png extension should be hidden', () => {
        expect(shouldHideDownload(download, hidePNGsCustomExtension)).toBe(true);
    });

    test('png mime should be hidden', () => {
        expect(shouldHideDownload(download, hidePNGsCustomMime)).toBe(true);
    });

    test('all types should be hidden', () => {
        expect(shouldHideDownload(download, hideAll)).toBe(true);
    });
});

describe('test shouldIgnoreDownload', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const ignorePNGs = mergeSyncDefaultOptions({
        ignoredFileTypes: [{name: 'PNG', mimes: ['image/png'], extensions: ['png']}],
    });

    const ignorePNGsCustomExtension = mergeSyncDefaultOptions({
        ignoredCustomTypes: ['png'],
    });

    const ignorePNGsCustomMime = mergeSyncDefaultOptions({
        ignoredCustomTypes: ['image/png'],
    });

    test('file should not be ignored with default options', () => {
        expect(shouldIgnoreDownload(download, defaultSyncOptions())).toBe(false);
    });

    test('png filetype should be ignored', () => {
        expect(shouldIgnoreDownload(download, ignorePNGs)).toBe(true);
    });

    test('png extension should be ignored', () => {
        expect(shouldIgnoreDownload(download, ignorePNGsCustomExtension)).toBe(true);
    });

    test('png mime should be ignored', () => {
        expect(shouldIgnoreDownload(download, ignorePNGsCustomMime)).toBe(true);
    });
});

describe('test downloadMatchesFiletypes', () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'}));

    const imageFiletypes = fileTypes['Images'];
    const documentsFiletypes = fileTypes['Documents'];

    test('image download should match image file types', () => {
        expect(downloadMatchesFiletypes(download, imageFiletypes)).toBe(true);
    });

    test('image download should not match document filetypes', () => {
        expect(downloadMatchesFiletypes(download, documentsFiletypes)).toBe(false);
    });
});

describe('test downloadMatchesCustomTypes', () => {
    const downloads = [
        new DSBDownload(utils.makeDownloadItem({filename: 'test.png', mime: 'image/png'})),
        new DSBDownload(utils.makeDownloadItem({filename: 'test.test.png', mime: 'image/png'})),
        new DSBDownload(utils.makeDownloadItem({filename: 'test-test.png', mime: 'image/png'})),
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
                expect(downloadMatchesCustomTypes(download, imageExtensions)).toBe(true);
            });

            test('image download should match image file types', () => {
                expect(downloadMatchesCustomTypes(download, imageMimetypes)).toBe(true);
            });

            test('image download should not match document filetypes', () => {
                expect(downloadMatchesCustomTypes(download, textExtensions)).toBe(false);
            });

            test('image download should not match document filetypes', () => {
                expect(downloadMatchesCustomTypes(download, textMimetypes)).toBe(false);
            });

            test('image download should match pattern', () => {
                expect(downloadMatchesCustomTypes(download, patterns)).toBe(true);
            });
        });
    }
});

test('test makeFakeDownload', () => {
    expect(makeFakeDownload({})).toBeInstanceOf(DSBDownload);
});