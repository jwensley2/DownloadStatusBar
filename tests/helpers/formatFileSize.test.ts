import {formatFileSize} from '../../src/helpers/formatFileSize';

test('test formatFileSize', () => {
    const kb = 1024;
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    const tb = 1024 * 1024 * 1024 * 1024;

    expect(formatFileSize(1)).toBe('1B');
    expect(formatFileSize(kb * 1.5)).toBe('1.5KB');
    expect(formatFileSize(kb * 1.1, true)).toBe('1KB');
    expect(formatFileSize(kb * 1.9, true)).toBe('2KB');
    expect(formatFileSize(kb)).toBe('1KB');
    expect(formatFileSize(mb)).toBe('1MB');
    expect(formatFileSize(gb)).toBe('1GB');
    expect(formatFileSize(tb)).toBe('1TB');
});