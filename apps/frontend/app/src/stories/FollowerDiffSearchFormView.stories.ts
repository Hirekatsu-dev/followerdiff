import FollowerDiffSearchFormView from './../components/FollowerDiffSearchFormView.vue';
import { FollowerDiffSearchForm } from '../forms/FollowerDiffSearchForm';
import { ref } from 'vue';

const ARG_TYPES = {
}

export default {
  title: 'Components/FollowerDiffSearchFormView',
  component: FollowerDiffSearchFormView,
  argTypes: ARG_TYPES,
}

export const basic = () => ({
  props: Object.keys(ARG_TYPES),
  components: {
    FollowerDiffSearchFormView
  },
  setup() {
    const form = ref(new FollowerDiffSearchForm({}));

    const onSearch = async () => {
      alert(`form: ${JSON.stringify(form.value.fields)}`)
      return;
    };

    return ({
      form,
      onSearch,
    })
  },
  template: `
		<FollowerDiffSearchFormView
      :form="form"
      :onSearch="onSearch"
    />
	`,
})