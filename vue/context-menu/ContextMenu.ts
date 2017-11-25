import {PluginFunction, PluginObject} from 'vue';
import {VueConstructor} from 'vue/types/vue';
import ContextMenuComponent from './ContextMenu.vue';
import events from './events';

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $contextMenu: {
            open: Function,
            close: Function
        }
    }
}

class ContextMenu implements PluginObject<{}> {
    install: PluginFunction<{}>;
    static installed = false;

    static install(Vue: VueConstructor, options?: {}) {
        if (ContextMenu.installed) {
            return;
        }

        ContextMenu.installed = true;

        Vue.component(ContextMenuComponent.name, ContextMenuComponent);
        Vue.prototype.$contextMenu = {
            open(items: Object[], position: Object) {
                events.$emit('openMenu', items, position);
            },
            close() {
                events.$emit('closeMenu');
            }
        };

        Vue.mixin({
            methods: {
                showContextMenu(event, download: DownloadItem) {
                    events.$emit('openMenu', {
                        download: download,
                        position: event.position,
                    });
                }
            }
        })
    }
}

export default ContextMenu;