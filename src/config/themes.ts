import {localize} from '@/helpers';

type Colors = {
    background: string,
    backgroundHover: string,
    button: string,
    buttonHover: string,
    buttonBorder: string,
    border: string,
    download: string,
    progress: string,
    text: string,
    error: string,
};

export type Theme = {
    id: string,
    name: string,
    custom: boolean,
    colors: Colors
}

export const darkTheme: Theme = {
    id: 'dark',
    name: localize('themeDark'),
    custom: false,
    colors: {
        background: '#333333',
        backgroundHover: '#666666',
        button: 'transparent',
        buttonHover: '#444444',
        buttonBorder: '#555555',
        border: '#111111',
        download: '#666666',
        progress: '#222222',
        text: '#EEEEEE',
        error: '#73100D'
    }
};

export const lightTheme: Theme = {
    id: 'light',
    name: localize('themeLight'),
    custom: false,
    colors: {
        background: '#EFEFEF',
        backgroundHover: '#FFFFFF',
        button: 'transparent',
        buttonHover: '#CCCCCC',
        buttonBorder: '#AAAAAA',
        border: '#888888',
        download: '#AAAAAA',
        progress: '#2A911F',
        text: '#111111',
        error: '#FF574F'
    }
};

export const colorLabels: Colors = {
    background: localize('customizeThemeLabelBackground'),
    backgroundHover: localize('customizeThemeLabelBackgroundHover'),
    button: localize('customizeThemeLabelButton'),
    buttonHover: localize('customizeThemeLabelButtonHover'),
    buttonBorder: localize('customizeThemeLabelButtonBorder'),
    border: localize('customizeThemeLabelBorder'),
    download: localize('customizeThemeLabelDownload'),
    progress: localize('customizeThemeLabelProgress'),
    text: localize('customizeThemeLabelText'),
    error: localize('customizeThemeLabelError'),
};

export const defaultThemes: Array<Theme> = [
    darkTheme,
    lightTheme
];