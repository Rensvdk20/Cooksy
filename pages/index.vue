<script setup lang="ts">
import RecipeItem from '~/components/home/RecipeItem.vue';
import type { Recipe } from '~/types/recipe';

const recipes = await $fetch<Recipe[]>('/api/recipes');
</script>

<template>
	<NuxtLayout>
		<div class="max-w-[1200px] mx-auto px-4 py-8">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<RecipeItem v-for="recipe in recipes" :recipe :key="recipe.id" />
			</div>
		</div>
	</NuxtLayout>
</template>
