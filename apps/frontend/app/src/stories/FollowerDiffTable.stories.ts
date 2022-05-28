import FollowerDiffTable from '../components/FollowerDiffTable.vue';
import { ref, Ref } from 'vue'
import { FollowerDiff } from '../models/FollowerDiff';
import { sleep } from './util/sleep'

const ARG_TYPES = {
  count: {
    control: { type: 'select' },
    options: [0, 10, 100],
    defaultValue: 0,
  }
}

export default {
  title: 'Components/FollowerDiffTable',
  component: FollowerDiffTable,
  argTypes: ARG_TYPES,
};

export const basic = (arg: any) => ({
  components: {
    FollowerDiffTable
  },
  setup() {
    const items: Ref<FollowerDiff[]> = ref([]);
    const isLoading = ref(false);

    const onClick = async () => {
      const { count } = arg;
      isLoading.value = true;
      items.value = [];

      await sleep(1000);

      items.value = [...Array(count)].map((_: undefined, idx: number) => {
        if (idx < arg.count / 2) {
          return new FollowerDiff('00000000', '-', 'test', 'テスト太郎');
        } else {
          return new FollowerDiff('00000000', '+', 'test', 'テスト太郎');
        }
      });
      isLoading.value = false;
    };

    return ({
      items,
      isLoading,
      onClick,
    });
  },
  template: `
    <button
      @click="onClick"
    >
      再取得
    </button>
		<FollowerDiffTable
      class="tw-h-64"
			:items="items"
      :loading="isLoading"
		/>
	`,
})