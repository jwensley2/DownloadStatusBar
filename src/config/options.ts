import {FileType} from "./filetypes";

/**
 * Options to save in the synced storage
 */
export type SyncOptions = {
    theme: string,
    alwaysShow: boolean,
    showInfoText: boolean,
    autohideEnable: boolean,
    autohideDuration: number,
    autohideFileTypes: FileType[],
    autohideCustomTypes: string[],
    ignoredFileTypes: FileType[],
    ignoredCustomTypes: string[],
    playSoundOnComplete: boolean,
    minimized: boolean,
    refreshRate: number,
    clearHistory: boolean
}

export const defaultSyncOptions: SyncOptions = {
    theme: "light",
    alwaysShow: false,
    showInfoText: true,
    autohideEnable: false,
    autohideDuration: 5,
    autohideFileTypes: [],
    autohideCustomTypes: [],
    ignoredFileTypes: [],
    ignoredCustomTypes: [],
    playSoundOnComplete: false,
    minimized: false,
    refreshRate: 1000,
    clearHistory: false,
};

/**
 * Options to save in local storage
 */
export type LocalOptions = {
    customSound?: {
        name: string,
        data: string,
    },
}

export const defaultLocalOptions: LocalOptions = {};