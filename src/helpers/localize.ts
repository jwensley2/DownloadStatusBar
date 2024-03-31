/**
 * Localize a string
 * @returns {string}
 */
export function localize(messageName: string, substitutions?: string | string[]): string {
    if (typeof browser === 'undefined') {
        return messageName;
    }

    return browser.i18n.getMessage(messageName, substitutions);
}