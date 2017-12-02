import Vue, {VNode} from 'vue';
import Options from './components/Options.vue';

let app = new Vue({
    el: '#options',
    render(render): VNode {
        return render(Options, {});
    }
});