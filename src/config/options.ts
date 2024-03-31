import {FileType} from '@/config/filetypes';
import {lightTheme, Theme} from '@/config/themes';
import StorageObject = browser.storage.StorageObject;

/**
 * Options to save in the synced storage
 */
export interface SyncOptions extends StorageObject {
    theme: string;
    customThemes: Theme[];
    alwaysShow: boolean;
    showInfoText: boolean;
    autohideEnable: boolean;
    autohideDuration: number;
    autohideFileTypes: FileType[];
    autohideCustomTypes: string[];
    ignoredFileTypes: FileType[];
    ignoredCustomTypes: string[];
    playSoundOnComplete: boolean;
    playSoundDownloadDuration: number;
    minimized: boolean;
    refreshRate: number;
    clearHistory: boolean;
    clearFailed: boolean;
    clearAfterOpening: boolean;
    fontSize: number;
    clearPosition: 'left' | 'right';
}

export const defaultSyncOptions = (): SyncOptions => ({
    theme: lightTheme().id,
    customThemes: [],
    alwaysShow: false,
    showInfoText: true,
    autohideEnable: false,
    autohideDuration: 5,
    autohideFileTypes: [],
    autohideCustomTypes: [],
    ignoredFileTypes: [],
    ignoredCustomTypes: [],
    playSoundOnComplete: false,
    playSoundDownloadDuration: 1,
    minimized: false,
    refreshRate: 1000,
    clearHistory: false,
    clearFailed: false,
    clearAfterOpening: false,
    fontSize: 16,
    clearPosition: 'left',
});

/**
 * Options to save in local storage
 */
type Sound = {
    name: string;
    data: string;
};

export type LocalOptions = {
    customSound: Sound | undefined;
}

export const defaultLocalOptions = (): LocalOptions => ({
    customSound: undefined,
});