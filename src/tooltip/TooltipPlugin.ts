import {App} from 'vue';
import TooltipComponent from '@/tooltip/Tooltip.vue';
import events from '@/tooltip/events';

export default {
    install(app: App) {
        app.component('tooltip', TooltipComponent);

        const show = (element: HTMLElement, downloadId: number) => {
            events.emit('showTooltip', {
                id: downloadId,
                element: element,
            });
        };

        const hide = () => {
            events.emit('hideTooltip');
        };

        app.provide('showTooltip', show);
        app.provide('hideTooltip', hide);
    }
};