import '../src/index.css';
import Datepicker from '@vuepic/vue-datepicker';
import Popper from "vue3-popper";
import '@vuepic/vue-datepicker/dist/main.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}