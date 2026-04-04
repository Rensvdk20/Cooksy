<script setup lang="ts">
import RecipeItem from "~/components/home/RecipeItem.vue";
import type { Recipe } from "~/schemas/recipe/recipeSchema";

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);

const { data: recipes, pending } = useFetch<Recipe[]>("/api/recipes", {
	lazy: true,
	server: false,
	default: () => [],
});

definePageMeta({
	title: "Recipes | Cooksy",
	description: "Browse and manage your recipes",
});

useHead({
	title: "Recipes | Cooksy",
});
</script>

<template>
	<div class="max-w-[1200px] mx-auto px-4 pb-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<template v-if="pending">
				<div
					v-for="item in skeletonCards"
					:key="`skeleton-${item}`"
					class="recipe-skeleton h-60 rounded-xl"
				>
					<div class="recipe-skeleton__image h-full"></div>
				</div>
			</template>
			<template v-else-if="recipes.length > 0">
				<RecipeItem
					v-for="recipe in recipes"
					:recipe
					:key="recipe.id"
				/>
			</template>
			<div v-else>No recipes found</div>
		</div>
	</div>
</template>
