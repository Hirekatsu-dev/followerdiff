<template>
  <div class="tw-rounded-lg tw-border-t-sky-400 tw-shadow-md tw-flex tw-flex-col tw-items-start tw-space-y-4 tw-p-4"
    :style="{
      'border-top-style': 'solid',
      'border-top-width': '1rem'
    }">
    <div class="tw-w-full tw-flex tw-justify-start tw-space-x-4">
      <div class="tw-shrink-0 tw-flex tw-flex-col">
        <span>Twitter ID</span>
        <input class="tw-border-gray-300 tw-border-solid tw-rounded-md tw-w-44 tw-h-8"
          :style="{ 'border-width': '1px' }" v-model.trim="form.fields.id" />
        <span v-if="form.error.id" class="tw-text-red-600">
          {{ form.error.id }}
        </span>
      </div>
      <div class="tw-shrink-0 tw-flex tw-flex-col">
        <span>From</span>
        <DatePicker v-model="form.fields.from" />
        <span v-if="form.error.from" class="tw-text-red-600">
          {{ form.error.from }}
        </span>
      </div>
      <div class="tw-shrink-0 tw-flex tw-flex-col">
        <span>To</span>
        <DatePicker v-model="form.fields.to" />
        <span v-if="form.error.to" class="tw-text-red-600">
          {{ form.error.to }}
        </span>
      </div>
    </div>
    <div class="tw-w-full tw-flex tw-justify-center">
      <button class="tw-rounded-lg tw-w-32 tw-bg-sky-400 disabled:tw-cursor-wait disabled:tw-bg-sky-600"
        :disabled="isLoading" @click="search">
        <span class="tw-font-bold tw-text-white">{{ isLoading ? '検索中...' : '比較する' }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { FollowerDiffSearchForm } from '../forms/FollowerDiffSearchForm';
import DatePicker from './DatePicker.vue';


interface Props {
  onSearch: (form: FollowerDiffSearchForm) => Promise<void>,
  form: FollowerDiffSearchForm,
}

const isLoading = ref(false);

const props = defineProps<Props>();

const { form } = toRefs(props);

const search = async () => {
  if (!form.value.validate()) {
    return;
  }

  try {
    isLoading.value = true;
    await props.onSearch(form.value);

  } finally {
    isLoading.value = false;
  }
};
</script>