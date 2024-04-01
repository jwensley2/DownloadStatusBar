import {localize} from '@/helpers/localize';

type Colors = {
    text: string;
    background: string;
    backgroundHover: string;
    button: string;
    buttonHover: string;
    buttonBorder: string;
    border: string;
    download: string;
    progress: string;
    complete: string;
    error: string;
};

export type Theme = {
    id: string;
    name: string;
    custom: boolean;
    colors: Colors;
    base?: string;
}

export const darkTheme = (): Theme => ({
    id: 'dark',
    name: localize('themeDark'),
    custom: false,
    colors: {
        text: '#EEEEEE',
        background: '#333333',
        backgroundHover: '#666666',
        button: 'transparent',
        buttonHover: '#444444',
        buttonBorder: '#555555',
        border: '#111111',
        download: '#666666',
        progress: '#222222',
        complete: '#222222',
        error: '#73100D',
    },
});

export const lightTheme = (): Theme => ({
    id: 'light',
    name: localize('themeLight'),
    custom: false,
    colors: {
        text: '#111111',
        background: '#EFEFEF',
        backgroundHover: '#FFFFFF',
        button: 'transparent',
        buttonHover: '#CCCCCC',
        buttonBorder: '#AAAAAA',
        border: '#888888',
        download: '#AAAAAA',
        progress: '#2A911F',
        complete: '#2A911F',
        error: '#FF574F',
    },
});

export const colorLabels = (): Colors => ({
    text: localize('customizeThemeLabelText'),
    background: localize('customizeThemeLabelBackground'),
    backgroundHover: localize('customizeThemeLabelBackgroundHover'),
    button: localize('customizeThemeLabelButton'),
    buttonHover: localize('customizeThemeLabelButtonHover'),
    buttonBorder: localize('customizeThemeLabelButtonBorder'),
    border: localize('customizeThemeLabelBorder'),
    download: localize('customizeThemeLabelDownload'),
    progress: localize('customizeThemeLabelProgress'),
    complete: localize('customizeThemeLabelComplete'),
    error: localize('customizeThemeLabelError'),
});

export const defaultThemes: Array<Theme> = [
    darkTheme(),
    lightTheme(),
];