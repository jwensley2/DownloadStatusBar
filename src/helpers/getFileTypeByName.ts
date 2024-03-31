import fileTypes, {FileType} from '@/config/filetypes';
import _ from 'lodash';

/**
 * Get a filetype by the name
 *
 * @param {string} ft
 * @returns {FileType | undefined}
 */
export function getFileTypeByName(ft: string): FileType | undefined {
    return _.find(_.flatMap(fileTypes), (fileType) => {
        return fileType.name === ft;
    });
}