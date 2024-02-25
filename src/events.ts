import mitt, {Emitter} from 'mitt';
import {DSBDownload} from './DSBDownload';

type Events = {
    clearDownloads: null,
    clearDownload: DSBDownload,
    openDownload: DSBDownload,
    showDownload: DSBDownload,
    cancelDownload: DSBDownload,
    pauseDownload: DSBDownload,
    resumeDownload: DSBDownload,
    deleteDownload: DSBDownload,
    openOptions: null,
};

const events: Emitter<Events> = mitt<Events>();

export default events;