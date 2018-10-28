import {PluginFunction, PluginObject} from 'vue';
import {VueConstructor} from 'vue/types/vue';
import ContextMenuComponent from './ContextMenu.vue';
import events from './events';
import DownloadItem = browser.downloads.DownloadItem;

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $contextMenu: {
            open: Function,
            close: Function
        }
    }
}

export default class ContextMenuPlugin implements PluginObject<{}> {
    [key: string]: any;

    install: PluginFunction<{}>;
    static installed = false;

    static install(Vue: VueConstructor, options?: {}) {
        if (ContextMenuPlugin.installed) {
            return;
        }

        ContextMenuPlugin.installed = true;

        Vue.component(ContextMenuComponent.tag, ContextMenuComponent);

        Vue.prototype.$contextMenu = {
            open(items: Object[], position: Object) {
                events.$emit('openMenu', items, position);
            },
            close() {
                events.$emit('closeMenu');
            },
        };

        Vue.mixin({
            methods: {
                showContextMenu(event, download: DownloadItem) {
                    events.$emit('openMenu', {
                        download: download,
                        position: event.position,
                    });
                },
            },
        })
    }
}