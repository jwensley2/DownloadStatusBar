import {getFileTypeByName} from '@/helpers/getFileTypeByName';
import {getThemeById} from '@/helpers/getThemeById';
import {darkTheme, lightTheme} from '@/config/themes';
import fileTypes from '@/config/filetypes';

test('test getFileTypeByName', () => {
    expect(getFileTypeByName('PNG')).toBe(fileTypes.Images[0]);
});

test('test getThemeById returns a default theme', () => {
    expect(getThemeById('dark')).toStrictEqual(darkTheme());
    expect(getThemeById('light')).toStrictEqual(lightTheme());
});

test('test getThemeById returns a custom theme', () => {
    const myTheme = {
        id: 'my-theme',
        name: 'My Theme',
        custom: true,
        base: darkTheme().id,
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
    };

    expect(getThemeById(myTheme.id, [myTheme])).toStrictEqual(myTheme);
});

test('test getThemeById returns the light theme by default', () => {
    expect(getThemeById('non-existent-id')).toStrictEqual(lightTheme());
});