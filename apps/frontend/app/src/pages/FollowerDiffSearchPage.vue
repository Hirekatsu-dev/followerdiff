<template>
  <div class="tw-flex tw-flex-col tw-space-y-4 tw-p-4" :style="{
    'min-width': '1200px',
    'min-height': '800px'
  }">
    <FollowerDiffSearchFormView :form="form" :onSearch="executeSearch" />
    <FollowerDiffTable class="tw-overflow-auto" :items="followerDiffList" :loading="isLoading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue';
import { useRouter } from 'vue-router';
import FollowerDiffTable from '../components/FollowerDiffTable.vue'
import FollowerDiffSearchFormView from '../components/FollowerDiffSearchFormView.vue'
import { FollowerDiffSearchForm } from '../forms/FollowerDiffSearchForm'
import { FollowerDiff } from '../models/FollowerDiff'
import { useApi } from '../api/api';
import format from 'date-fns/format';

const router = useRouter();

const today = format(new Date(), 'yyyy-MM-dd');

const query = router.currentRoute.value.query;

const initFormFields = {
  id: query['id']?.toString() ?? null,
  from: query['from']?.toString() ?? today,
  to: query['to']?.toString() ?? today,
};

const initialForm = new FollowerDiffSearchForm(initFormFields);
const form = ref<FollowerDiffSearchForm>(initialForm);
const followerDiffList: Ref<FollowerDiff[]> = ref([]);
const isLoading = ref(false);

const api = useApi();

async function executeSearch(form: FollowerDiffSearchForm) {
  try {
    isLoading.value = true;

    followerDiffList.value = await api.getListFollowerDiff(form);
  } finally {
    isLoading.value = false;
    updateRouter();
  }
}

function updateRouter() {
  const query = form.value.toQuery();

  router.push({
    query,
  });
}
</script>
