<script lang="ts" setup>
import type { Recipe } from '~/schemas/recipe/recipeSchema';

defineProps<{
	recipe: Recipe
}>();
</script>

<template>
	<NuxtLink :to="`/recipes/${recipe.id}`" class="max-h-60 rounded-xl relative">
		<img :src="recipe.main_img" :alt="recipe.name" class="w-full h-full object-cover rounded-xl">
		<div class="absolute bottom-0 left-0 bg-zinc-800 p-2 rounded-bl-xl rounded-tr-xl max-h-15 overflow-hidden">
			{{ recipe.name }}
		</div>
	</NuxtLink>
</template>
