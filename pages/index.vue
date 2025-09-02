<script setup lang="ts">
import RecipeItem from '~/components/home/RecipeItem.vue';
import type { Recipe } from '~/schemas/recipe/recipeSchema';

const recipes = await $fetch<Recipe[]>('/api/recipes');

definePageMeta({
	title: 'Recipes | Cooksy',
	description: 'Browse and manage your recipes',
});

useHead({
	title: 'Recipes | Cooksy',
});
</script>

<template>
	<div class="max-w-[1200px] mx-auto px-4 pb-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<RecipeItem v-if="recipes.length > 0" v-for="recipe in recipes" :recipe :key="recipe.id" />
			<div v-else>No recipes found</div>
		</div>
	</div>
</template>
