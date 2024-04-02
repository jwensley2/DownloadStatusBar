import _ from 'lodash';
import {defaultThemes, lightTheme, Theme} from '@/config/themes';

/**
 * Find the theme matching the provided theme id
 * @param {string} id
 * @param {Theme} customThemes
 */
export function getThemeById(id: string, customThemes: Theme[] = []): Theme {
    for (const theme of defaultThemes) {
        if (theme.id === id) {
            return theme;
        }
    }

    for (const customTheme of customThemes) {
        const baseTheme = _.find(defaultThemes, {id: customTheme.base}) ?? lightTheme();

        if (customTheme.id === id) {
            return _.merge(customTheme, _.merge({}, baseTheme, customTheme));
        }
    }

    return lightTheme();
}
