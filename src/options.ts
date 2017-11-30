import Vue, {VNode} from 'vue';
import Options from './components/Options.vue';

export type Options = {
    theme?: string,
    autohideEnable?: boolean,
    autohideDuration?: number
}

let app = new Vue({
    el: '#options',
    data: {
        theme: 'light',
        downloads: [],
    },
    render(render): VNode {
        return render(Options, {
            props: {
                theme: this.theme,
                downloads: this.downloads,
            }
        });
    }
});