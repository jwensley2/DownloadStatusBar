import * as tape from "tape";
import * as helpers from "../src/helpers";
import * as utils from "./utils";
import {DSBDownload} from "../src/DSBDownload";
import {defaultSyncOptions} from "../src/config/options";
import fileTypes from "../src/config/filetypes";

tape("shouldHideDownload", (t) => {
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

    t.plan(4);

    t.is(helpers.shouldHideDownload(download, defaultSyncOptions), false, "file should not be hidden with default options");
    t.is(helpers.shouldHideDownload(download, hidePNGs), true, "png filetype should be hidden");
    t.is(helpers.shouldHideDownload(download, hidePNGsCustomExtension), true, "png extension should be hidden");
    t.is(helpers.shouldHideDownload(download, hidePNGsCustomMime), true, "png mime should be hidden");
});

tape("shouldIgnoreDownload", (t) => {
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

    t.plan(4);

    t.is(helpers.shouldIgnoreDownload(download, defaultSyncOptions), false, "file should not be ignored with default options");
    t.is(helpers.shouldIgnoreDownload(download, ignorePNGs), true, "png filetype should be ignored");
    t.is(helpers.shouldIgnoreDownload(download, ignorePNGsCustomExtension), true, "png extension should be ignored");
    t.is(helpers.shouldIgnoreDownload(download, ignorePNGsCustomMime), true, "png mime should be ignored");
});

tape("downloadMatchesFiletypes", (t) => {
    const download = new DSBDownload(utils.makeDownloadItem({filename: "test.png", mime: "image/png"}));

    const imageFiletypes = fileTypes['Images'];
    const documentsFiletypes = fileTypes['Documents'];

    t.plan(2);

    t.is(helpers.downloadMatchesFiletypes(download, imageFiletypes), true, "image download should match image file types");
    t.is(helpers.downloadMatchesFiletypes(download, documentsFiletypes), false, "image download should not match document filetypes");
});

tape("downloadMatchesCustomTypes", (t) => {
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

tape("formatFileSize", (t) => {
    const kb = 1024;
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    const tb = 1024 * 1024 * 1024 * 1024;

    t.plan(6);

    t.is(helpers.formatFileSize(1), "1B", "1 byte is 1B");
    t.is(helpers.formatFileSize(kb * 1.5), "1.5KB", `${kb * 1.5} bytes is 1.5KB`);
    t.is(helpers.formatFileSize(kb), "1KB", `${kb} bytes is 1KB`);
    t.is(helpers.formatFileSize(mb), "1MB", `${mb} bytes is 1MB`);
    t.is(helpers.formatFileSize(gb), "1GB", `${gb} bytes is 1GB`);
    t.is(helpers.formatFileSize(tb), "1TB", `${tb} bytes is 1TB`);
});

tape("getFileTypeByName", (t) => {
    t.plan(1);

    t.is(helpers.getFileTypeByName('PNG'), fileTypes.Images[0], 'is a png filetype');
});