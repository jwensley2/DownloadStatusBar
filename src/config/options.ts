import {FileType} from './filetypes';

export type Options = {
    theme: string,
    alwaysShow: boolean,
    singleRowOnly: boolean,
    showStatusText: boolean,
    showProgressText: boolean,
    autohideEnable: boolean,
    autohideDuration: number,
    autohideFileTypes: Array<FileType>,
    autohideCustomTypes: Array<string>,
}

export const defaultOptions: Options = {
    theme: 'light',
    alwaysShow: false,
    singleRowOnly: false,
    showStatusText: true,
    showProgressText: true,
    autohideEnable: false,
    autohideDuration: 5,
    autohideFileTypes: [],
    autohideCustomTypes: [],
};