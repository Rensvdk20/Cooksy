<script lang="ts" setup>
import IngredientBlock from '~/components/recipes/IngredientBlock.vue';
import type { Recipe } from '~/types/recipe';

const route = useRoute();

const recipe = await $fetch<Recipe>(`/api/recipes/${route.params.id}`);
</script>

<template>
	<NuxtLayout>
		<div class="relative flex justify-center items-center h-100">
			<div class="absolute inset-0 bg-gradient-to-t from-zinc-900/100 via-zinc-900/50 to-zinc-900/0"></div>
			<div class="text-6xl absolute">{{ recipe.name }}</div>
			<img :src="recipe.main_img" alt="Katsudon" class="w-full h-100 object-cover">
		</div>

		<div class="max-w-[1200px] mx-auto py-8 bg-zinc-90">
			<div class="flex items-center max-w-fit p-2 m-4 cursor-pointer" @click="$router.back()">
				<svg class="inline-block" width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
				<span class="ml-2">Back</span>
			</div>
			<div class="grid grid-cols-1 lg:grid-cols-3 px-4 gap-6">
				<div class="p-6 lg:col-span-1 col-span-2 bg-zinc-800 rounded-xl shadow-md relative">
					<h1 class="text-3xl">Ingredients</h1>
					<div class="flex items-center justify-center absolute top-6 right-6 gap-2 bg-zinc-700 rounded-lg p-2">
						<svg width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
						<span>{{ recipe.servings }}</span>
					</div>
					<IngredientBlock v-for="ingredientBlock in recipe.ingredientBlocks" :ingredientBlock />
				</div>
				<div class="p-6 col-span-2 bg-zinc-800 rounded-xl shadow-md">
					<Step v-for="(step, index) in recipe.steps" :step :class="{ 'mt-8' : index !== 0 }" />
				</div>
			</div>
		</div>
	</NuxtLayout>
</template>
