<template>
  <router-view />
</template>

<script lang="ts" setup>
import { provideRemoteApi } from './api/api';

provideRemoteApi();
</script>