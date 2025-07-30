<script setup lang="ts">
import RecipeItem from '~/components/home/RecipeItem.vue';
import type { Recipe } from '~/schemas/recipe/recipeSchema';

const recipes = await $fetch<Recipe[]>('/api/recipes');
</script>

<template>
	<div class="max-w-[1200px] mx-auto px-4 pb-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<RecipeItem v-for="recipe in recipes" :recipe :key="recipe.id" />
		</div>
	</div>
</template>
