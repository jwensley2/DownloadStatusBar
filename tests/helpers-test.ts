import * as tape from "tape";
import * as helpers from "../src/helpers";
import * as utils from "./utils";
import {DSBDownload} from "../src/DSBDownload";
import {defaultSyncOptions} from "../src/config/options";

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