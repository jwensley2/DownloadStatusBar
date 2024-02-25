import {App} from 'vue';
import TooltipComponent from './Tooltip.vue';
import events from './events';

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $tooltip: {
            shown: boolean,
            show: Function,
            hide: Function
        }
    }
}

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

        app.mixin({
            methods: {
                showTooltip(element: HTMLElement, downloadId: number) {
                    events.emit('showTooltip', {
                        id: downloadId,
                        element: element
                    });
                },
                hideTooltip() {
                    events.emit('hideTooltip');
                },
            },
        })
    }
};