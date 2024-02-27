import {createApp} from 'vue';
import Options from '@/components/Options.vue';
import {createPinia} from 'pinia';

const pinia = createPinia();
const app = createApp(Options);

app.use(pinia);
app.mount('#options');