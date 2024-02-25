import mitt, {Emitter} from 'mitt';

type Events = {
    showTooltip: {
        id: number,
        element: HTMLElement,
    },
    hideTooltip: undefined
};

const events: Emitter<Events> = mitt<Events>();

export default events;