import {defaultThemes, lightTheme, Theme} from '@/config/themes';

/**
 * Find the theme matching the provided theme id
 * @param {string} id
 * @param {Theme} customThemes
 */
export function getThemeById(id: string, customThemes: Theme[] = []): Theme {
    for (let theme of defaultThemes) {
        if (theme.id === id) {
            return theme;
        }
    }

    for (let customTheme of customThemes) {
        if (customTheme.id === id) {
            return Object.assign(customTheme, Object.assign({}, lightTheme(), customTheme));
        }
    }

    return lightTheme();
}