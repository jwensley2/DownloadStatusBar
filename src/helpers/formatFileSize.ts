/**
 * Format a filesize in bytes to KB, MB, GB or TB
 *
 * @param {number} bytes
 * @param round
 * @returns {string}
 */
export function formatFileSize(bytes: number, round: boolean = false): string {
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes <= 0) return '0B';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));

    let size = Math.round(bytes / Math.pow(1024, i) * 100) / 100;

    if (round) {
        size = Math.round(size);
    }

    return size + sizes[i];
}