<script lang="ts" setup>
import type { Step } from '~/types/recipe';

defineProps<{
	step: Step
}>();
</script>
<template>
	<div>
		<h2 class="text-3xl">{{ step.name }}</h2>
		<p class="whitespace-pre-wrap">{{ step.instructions }}</p>
	</div>
</template>
