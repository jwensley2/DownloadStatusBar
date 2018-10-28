import {PluginFunction, PluginObject} from 'vue';
import {VueConstructor} from 'vue/types/vue';
import TooltipComponent from './Tooltip.vue';
import events from './events';
import DownloadItem = browser.downloads.DownloadItem;

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $tooltip: {
            shown: boolean,
            show: Function,
            hide: Function
        }
    }
}

export default class TooltipPlugin implements PluginObject<{}> {
    [key: string]: any;

    install: PluginFunction<{}>;
    static installed = false;

    static install(Vue: VueConstructor, options?: {}) {
        if (TooltipPlugin.installed) {
            return;
        }

        TooltipPlugin.installed = true;

        Vue.component(TooltipComponent.tag, TooltipComponent);

        Vue.prototype.$tooltip = {
            show(download: DownloadItem, position: Object) {
                events.$emit('showTooltip', download, position);
            },
            hide() {
                events.$emit('hideTooltip');
            },
        };

        Vue.mixin({
            methods: {
                showTooltip(element: HTMLElement, downloadId: number) {
                    events.$emit('showTooltip', downloadId, element);
                },
                hideTooltip() {
                    events.$emit('hideTooltip');
                },
            },
        })
    }
}
