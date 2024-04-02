import {App} from 'vue';
import ContextMenuComponent from './ContextMenu.vue';
import events from './events';
import {ContextMenuItem, ContextMenuPosition} from './types';

export default {
    install(app: App) {
        app.component('context-menu', ContextMenuComponent);

        const open = (items: ContextMenuItem[], position: ContextMenuPosition) => {
            events.emit('openMenu', {
                items: items,
                position: position
            });
        };

        const close = () => {
            events.emit('closeMenu');
        };

        app.provide('openContextMenu', open);
        app.provide('closeContextMenu', close);
    }
}