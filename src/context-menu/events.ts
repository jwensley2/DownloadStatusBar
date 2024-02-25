import mitt, {Emitter} from 'mitt';
import {ContextMenuItem, ContextMenuPosition} from './types';

type Events = {
    openMenu: {
        items: ContextMenuItem[],
        position: ContextMenuPosition,
    },
    closeMenu: undefined
};

const events: Emitter<Events> = mitt<Events>();

export default events;