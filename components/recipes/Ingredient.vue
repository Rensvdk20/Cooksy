<script setup lang="ts">
import type { Ingredient } from '~/types/recipe';

defineProps<{
	ingredient: Ingredient
}>();
</script>

<template>
	<li class="m-0">
		<label class="flex items-center cursor-pointer py-1.5">
			<input type="checkbox" />
			{{ ingredient.name }}
		</label>
	</li>
</template>
