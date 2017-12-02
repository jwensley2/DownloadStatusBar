import {FileType} from './filetypes';

export type Options = {
    theme: string,
    showStatusText: boolean,
    showProgressText: boolean,
    autohideEnable: boolean,
    autohideDuration: number,
    autohideFileTypes: Array<FileType>,
    autohideCustomTypes: Array<string>,
}

export const defaultOptions: Options = {
    theme: 'light',
    showStatusText: true,
    showProgressText: true,
    autohideEnable: false,
    autohideDuration: 5,
    autohideFileTypes: [],
    autohideCustomTypes: [],
};