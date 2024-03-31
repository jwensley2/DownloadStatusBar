import {createApp} from 'vue';
import Options from '@/components/Options.vue';
import {createPinia} from 'pinia';
import {localize} from '@/helpers/localize'

document.title = localize('optionsPageTitle');

const pinia = createPinia();
const app = createApp(Options);

app.use(pinia);
app.mount('#options');