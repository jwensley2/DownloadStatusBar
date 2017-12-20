import {PluginFunction, PluginObject} from "vue";
import {VueConstructor} from "vue/types/vue";
import TooltipComponent from "./Tooltip.vue";
import events from "./events";
import DownloadItem = browser.downloads.DownloadItem;

declare module "vue/types/vue" {
    // 3. Declare augmentation for Vue
    interface Vue {
        $tooltip: {
            show: Function,
            hide: Function
        }
    }
}

class Tooltip implements PluginObject<{}> {
    install: PluginFunction<{}>;
    static installed = false;

    static install(Vue: VueConstructor, options?: {}) {
        if (Tooltip.installed) {
            return;
        }

        Tooltip.installed = true;

        Vue.component("tooltip", TooltipComponent);
        Vue.prototype.$tooltip = {
            show(download: DownloadItem, position: Object) {
                events.$emit("showTooltip", download, position);
            },
            hide() {
                events.$emit("hideTooltip");
            },
        };

        Vue.mixin({
            methods: {
                showTooltip(element: HTMLElement, download: DownloadItem) {
                    events.$emit("showTooltip", download, element);
                },
                hideTooltip() {
                    events.$emit("hideTooltip");
                },
            },
        })
    }
}

export default Tooltip;
