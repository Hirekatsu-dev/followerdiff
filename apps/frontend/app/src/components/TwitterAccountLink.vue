<template>
  <a :href="link">{{ id }}</a>
</template>

<script lang="ts" setup>
interface Props {
  id: string
}

const props = defineProps<Props>();

const link = `https://twitter.com/intent/user?user_id=${props.id}`
</script>