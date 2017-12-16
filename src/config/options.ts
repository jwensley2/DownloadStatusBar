import {FileType} from './filetypes';

/**
 * Options to save in the synced storage
 */
export type SyncOptions = {
    theme: string,
    alwaysShow: boolean,
    singleRowOnly: boolean,
    showStatusText: boolean,
    showProgressText: boolean,
    autohideEnable: boolean,
    autohideDuration: number,
    autohideFileTypes: Array<FileType>,
    autohideCustomTypes: Array<string>,
    playSoundOnComplete: boolean,
    minimized: boolean
}

export const defaultSyncOptions: SyncOptions = {
    theme: 'light',
    alwaysShow: false,
    singleRowOnly: false,
    showStatusText: true,
    showProgressText: true,
    autohideEnable: false,
    autohideDuration: 5,
    autohideFileTypes: [],
    autohideCustomTypes: [],
    playSoundOnComplete: false,
    minimized: false,
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

export const defaultLocalOptions: LocalOptions = {
    customSound: undefined,
};