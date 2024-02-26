import * as helpers from "../src/helpers";
import * as utils from "./utils";
import {DSBDownload} from "../src/DSBDownload";
import {defaultSyncOptions} from "../src/config/options";
import fileTypes from "../src/config/filetypes";

test("shouldHideDownload", () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: "test.png", mime: "image/png"}));

    const hidePNGs = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideFileTypes: [{name: "PNG", mimes: ["image/png"], extensions: ["png"]}],
    });

    const hidePNGsCustomExtension = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ["png"],
    });

    const hidePNGsCustomMime = helpers.mergeSyncDefaultOptions({
        autohideEnable: true,
        autohideCustomTypes: ["image/png"],
    });

    expect.assertions(4);

    expect(helpers.shouldHideDownload(download, defaultSyncOptions)).toBe(false);
    expect(helpers.shouldHideDownload(download, hidePNGs)).toBe(true);
    expect(helpers.shouldHideDownload(download, hidePNGsCustomExtension)).toBe(true);
    expect(helpers.shouldHideDownload(download, hidePNGsCustomMime)).toBe(true);
});

test("shouldIgnoreDownload", () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: "test.png", mime: "image/png"}));

    const ignorePNGs = helpers.mergeSyncDefaultOptions({
        ignoredFileTypes: [{name: "PNG", mimes: ["image/png"], extensions: ["png"]}],
    });

    const ignorePNGsCustomExtension = helpers.mergeSyncDefaultOptions({
        ignoredCustomTypes: ["png"],
    });

    const ignorePNGsCustomMime = helpers.mergeSyncDefaultOptions({
        ignoredCustomTypes: ["image/png"],
    });

    expect.assertions(4);

    expect(helpers.shouldIgnoreDownload(download, defaultSyncOptions)).toBe(false);
    expect(helpers.shouldIgnoreDownload(download, ignorePNGs)).toBe(true);
    expect(helpers.shouldIgnoreDownload(download, ignorePNGsCustomExtension)).toBe(true);
    expect(helpers.shouldIgnoreDownload(download, ignorePNGsCustomMime)).toBe(true);
});

test("downloadMatchesFiletypes", () => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: "test.png", mime: "image/png"}));

    const imageFiletypes = fileTypes['Images'];
    const documentsFiletypes = fileTypes['Documents'];

    expect.assertions(2);

    expect(helpers.downloadMatchesFiletypes(download, imageFiletypes)).toBe(true);
    expect(helpers.downloadMatchesFiletypes(download, documentsFiletypes)).toBe(false);
});

test("downloadMatchesCustomTypes", () => {
    const downloads = [
        new DSBDownload(utils.makeDownloadItem({filename: "test.png", mime: "image/png"})),
        new DSBDownload(utils.makeDownloadItem({filename: "test.test.png", mime: "image/png"})),
        new DSBDownload(utils.makeDownloadItem({filename: "test-test.png", mime: "image/png"}))
    ];

    const imageExtensions = ['png', 'jpg'];
    const imageMimetypes = ['image/png', 'image/jpeg'];
    const textExtensions = ['txt', 'doc'];
    const textMimetypes = ['text/plain'];
    const patterns = ['*test.png'];

    for (let download of downloads) {
        const filename = download.downloadItem.filename;

        t.test(filename, function (st) {
            st.plan(5);
            st.is(helpers.downloadMatchesCustomTypes(download, imageExtensions), true, "image download should match image file types");
            st.is(helpers.downloadMatchesCustomTypes(download, imageMimetypes), true, "image download should match image file types");
            st.is(helpers.downloadMatchesCustomTypes(download, textExtensions), false, "image download should not match document filetypes");
            st.is(helpers.downloadMatchesCustomTypes(download, textMimetypes), false, "image download should not match document filetypes");
            st.is(helpers.downloadMatchesCustomTypes(download, patterns), true, "image download should match pattern");
        });
    }
});

test("formatFileSize", () => {
    const kb = 1024;
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    const tb = 1024 * 1024 * 1024 * 1024;

    expect.assertions(6);

    expect(helpers.formatFileSize(1)).toBe("1B");
    expect(helpers.formatFileSize(kb * 1.5)).toBe("1.5KB");
    expect(helpers.formatFileSize(kb)).toBe("1KB");
    expect(helpers.formatFileSize(mb)).toBe("1MB");
    expect(helpers.formatFileSize(gb)).toBe("1GB");
    expect(helpers.formatFileSize(tb)).toBe("1TB");
});

test("getFileTypeByName", () => {
    expect.assertions(1);

    expect(helpers.getFileTypeByName('PNG')).toBe(fileTypes.Images[0]);
});