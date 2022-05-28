import TwitterAccountLink from '../components/TwitterAccountLink.vue';

export default {
  title: 'Components/TwitterAccountLink',
  component: TwitterAccountLink,
};

export const basic = () => ({
  components: {
    TwitterAccountLink
  },
  template: `
		<TwitterAccountLink
			id="00000000"
		/>
	`,
})