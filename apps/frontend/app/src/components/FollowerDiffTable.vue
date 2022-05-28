<template>
  <table class="tw-border-separate tw-border tw-overflow-hidden tw-rounded-lg tw-shadow-md"
    :style="{ 'border-spacing': 0, }">
    <thead class="tw-bg-blue-600 tw-block">
      <FollowerDiffTableHeader />
    </thead>
    <tbody class="tw-block tw-overflow-auto">
      <template v-if="loading">
        <tr>
          <td colspan="4">
            <div>
              検索中です。
            </div>
          </td>
        </tr>
      </template>
      <template v-else-if="!loading && items.length">
        <FollowerDiffTableRow v-for="item in items" :item="item" />
      </template>
      <template v-else>
        <tr>
          <td colspan="4">
            <div>
              差分はありません。
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { FollowerDiff } from '../models/FollowerDiff'
import FollowerDiffTableHeader from './FollowerDiffTableHeader.vue'
import FollowerDiffTableRow from './FollowerDiffTableRow.vue'

interface Props {
  items: FollowerDiff[],
  loading?: boolean
}

const props = defineProps<Props>();
</script>