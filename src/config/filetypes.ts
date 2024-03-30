export type FileType = { name: string, mimes: string[], extensions: string[] };
export type FileTypeList = { [k: string]: FileType[] };

const fileTypes: FileTypeList = {
    'Images': [
        {name: 'PNG', mimes: ['image/png'], extensions: ['png']},
        {name: 'JPG', mimes: ['image/jpeg'], extensions: ['jpg', 'jpeg']},
        {name: 'GIF', mimes: ['image/gif'], extensions: ['gif']},
        {name: 'BMP', mimes: ['image/bmg'], extensions: ['bmp']},
    ],
    'Video': [
        {name: 'MP4', mimes: ['video/mp4'], extensions: ['mp4']},
        {name: 'WebM', mimes: ['video/webm'], extensions: ['webm']},
        {name: 'WMV', mimes: ['video/x-ms-asf, application/vnd.ms-asf'], extensions: ['wmv']},
    ],
    'Documents': [
        {name: 'Text', mimes: ['text/plain'], extensions: ['txt']},
        {name: 'HTML', mimes: ['text/html'], extensions: ['htm', 'html']},
        {
            name: 'Word',
            mimes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            extensions: ['doc', 'docx'],
        },
        {
            name: 'Excel',
            mimes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            extensions: ['xls', 'xlsx'],
        },
    ],
    'Archives': [
        {name: 'Zip', mimes: ['application/zip'], extensions: ['zip']},
        {name: '7Zip', mimes: ['application/x-7z-compressed'], extensions: ['7zip']},
        {name: 'Tar', mimes: ['application/x-tar'], extensions: ['tar']},
        {name: 'GZip', mimes: ['application/gzip'], extensions: ['gz']},
        {name: 'Rar', mimes: ['application/x-rar-compressed'], extensions: ['rar']},
        {name: 'BZip', mimes: ['application/x-bzip2'], extensions: ['bz2']},
    ],
    'File Sharing': [
        {name: 'Torrent', mimes: ['application/x-bittorrent'], extensions: ['torrent']},
        {name: 'NZB', mimes: ['application/x-nzb'], extensions: ['nzb']},
    ],
};

export default fileTypes;