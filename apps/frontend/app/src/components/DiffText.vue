<template>
  <span :class="color">{{ diff }}</span>
</template>

<script lang="ts" setup>

import { DiffType } from '../models/FollowerDiff'
import { computed } from 'vue'

interface Props {
  diff: DiffType
}

const props = defineProps<Props>();

const color = computed(() => {
  switch (props.diff) {
    case '+':
      return 'tw-text-green-700'
    case '-':
      return 'tw-text-red-700'
    default:
      return ''
  };
});
</script>