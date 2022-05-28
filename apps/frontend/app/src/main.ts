import { createApp } from 'vue'
import App from './App.vue'

// setup tailwindcss
import './index.css'

// setup datepicker
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// setup vue3-popper
import Popper from "vue3-popper";

import router from './router';

const app = createApp(App);

app.component('DatePicker', Datepicker);

app.component('Popper', Popper);

app.use(router);

app.mount('#app');
