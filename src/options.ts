import {createApp} from 'vue';
import Options from '@/components/Options.vue';
import {createPinia} from 'pinia';
import * as helpers from '@/helpers'

document.title = helpers.localize('optionsPageTitle');

const pinia = createPinia();
const app = createApp(Options);

app.use(pinia);
app.mount('#options');