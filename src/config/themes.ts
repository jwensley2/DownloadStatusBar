/**
 * Localize a string
 * @returns {string}
 */
function localize(messageName: string, substitutions?: string | string[]): string {
    // Fix for running in tests
    if (typeof browser === 'undefined') {
        return messageName;
    }

    return browser.i18n.getMessage(messageName, substitutions);
}

type Colors = {
    background: string,
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
    background: 'Background',
    button: 'Button',
    buttonHover: 'Button Hover',
    buttonBorder: 'Button Border',
    border: 'Border',
    download: 'Download',
    progress: 'Progress',
    text: 'Text',
    error: 'Error',
};

export const defaultThemes: Array<Theme> = [
    darkTheme,
    lightTheme
];