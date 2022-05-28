<template>
  <DatePicker :modelValue="modelValue" :enableTimePicker="false" :autoApply="true" :weekStart="0" format="yyyy/MM/dd(E)"
    :format-locale="ja" locale="ja" hideInputIcon @update:modelValue="onChangeValue" />
</template>

<script lang="ts" setup>
import DatePicker from '@vuepic/vue-datepicker';
import { ja } from 'date-fns/locale';
import format from 'date-fns/format';

interface Props {
  modelValue: string | null,
}
const props = defineProps<Props>();

const emits = defineEmits(['update:modelValue']);

const onChangeValue = (value: Date | null) => {
  if (!value) {
    emits('update:modelValue', value);

  } else {
    emits('update:modelValue', format(value, 'yyyy-MM-dd'));
  }
}

</script>