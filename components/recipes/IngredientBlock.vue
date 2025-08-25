<script setup lang="ts">
import type { IngredientBlock } from '~/types/recipe';

defineProps<{
	ingredientBlock: IngredientBlock
}>();
</script>
<template>
	<div class="mt-2">
		<h2>{{ ingredientBlock.name }}</h2>
		<ul class="pl-5 mt-2 space-y-2">
			<Ingredient v-for="ingredient in ingredientBlock.ingredients" :ingredient />
		</ul>
	</div>
</template>
