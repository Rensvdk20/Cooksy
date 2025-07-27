<script lang="ts" setup>
import type { Recipe } from '~/schemas/recipe/recipeSchema';

defineProps<{
	recipe: Recipe
}>();

const { loggedIn } = useUserSession();
</script>

<template>
	<NuxtLink v-if="!loggedIn" :to="`/recipes/${recipe.id}`" class="max-h-60 rounded-xl relative">
		<img :src="recipe.main_img" :alt="recipe.name" class="w-full h-full object-cover rounded-xl">
		<div class="absolute bottom-0 left-0 bg-zinc-800 p-2 rounded-bl-xl rounded-tr-xl max-h-15 overflow-hidden">
			{{ recipe.name }}
		</div>
	</NuxtLink>

	<div v-else class="max-h-60 rounded-xl relative">
		<NuxtLink :to="`/recipes/${recipe.id}`">
			<img :src="recipe.main_img" :alt="recipe.name" class="w-full h-full object-cover rounded-xl">
		</NuxtLink>
		<NuxtLink :to="`/recipes/${recipe.id}/edit`" class="flex gap-1 absolute bottom-0 left-0 bg-zinc-800 p-2 rounded-bl-xl rounded-tr-xl max-h-15 overflow-hidden">
			<svg class="w-4" fill="white" viewBox="0 0 640 640"><path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z"/></svg>
			{{ recipe.name }}
		</NuxtLink>
	</div>
</template>
