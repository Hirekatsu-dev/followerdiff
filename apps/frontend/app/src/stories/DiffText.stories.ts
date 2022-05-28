import DiffText from '../components/DiffText.vue';

const ARG_TYPES = {
  diff: {
    control: { type: 'select' },
    options: ['-', '+'],
  }
}

export default {
  title: 'Components/DiffText',
  component: DiffText,
  argTypes: ARG_TYPES,
};

export const basic = (args: any) => ({
  components: {
    DiffText
  },
  setup() {
    return args;
  },
  template: `
		<p>Value: {{ diff }}</p>
		<DiffText
			:diff="diff"
		/>
	`,
})