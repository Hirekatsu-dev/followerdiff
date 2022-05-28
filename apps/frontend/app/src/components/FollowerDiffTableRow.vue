<template>
  <tr class="hover:tw-bg-blue-100">
    <td class="tw-w-16 tw-text-center">
      <DiffText :diff="item.diff" />
    </td>
    <td class="tw-w-48">
      <TwitterAccountLink :id="item.twitterId" />
    </td>
    <td class="tw-w-64">
      <span class="tw-truncate">{{ item.screenName }}</span>
    </td>
    <td class="tw-w-64">
      <span class="tw-truncate">{{ item.name }}</span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { FollowerDiff } from '../models/FollowerDiff'
import { default as DiffText } from './DiffText.vue'
import { default as TwitterAccountLink } from './TwitterAccountLink.vue'

interface Props {
  item: FollowerDiff
}

const props = defineProps<Props>();
</script>