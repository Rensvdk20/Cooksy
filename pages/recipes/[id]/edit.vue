<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import type { EditIngredientBlock, EditRecipe } from '~/schemas/recipe/editRecipeSchema';

definePageMeta({
	middleware: ['auth'],
});

const route = useRoute();
const recipe = reactive<EditRecipe>(await $fetch(`/api/recipes/${route.params.id}`));

async function editRecipe() {
	recipe.ingredientBlocks?.forEach((block) => {
		block.ingredients = block.ingredients.filter(
			(ingredient) => ingredient.name?.trim()
		);
	});

	recipe.ingredientBlocks = recipe.ingredientBlocks?.filter(
		(block) => block.name?.trim() || block.ingredients.length > 0
	);

	recipe.steps = recipe.steps.filter(
		(step) => step.name?.trim() || step.instructions?.trim()
	);

	if(recipe.main_img.includes('data:image/')) {
		const uploadResponse = await $fetch('/api/image/upload', {
			method: 'POST',
			body: {
				base64Img: recipe.main_img,
			},
		});

		recipe.main_img = uploadResponse.imageUrl;
	}

	await $fetch(`/api/recipes/${route.params.id}`, {
		method: 'PUT',
		body: recipe
	});
}

function addIngredient(ingredientBlock: EditIngredientBlock) {
	ingredientBlock.ingredients.push({
		name: '',
	});
}

function addIngredientBlock() {
	recipe.ingredientBlocks.push({
		name: '',
		ingredients: [
			{ name: '' }
		],
	});
}

function addStep() {
	recipe.steps.push({
		name: '',
		instructions: '',
	});
}

function onImageChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input?.files?.[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = () => {
		recipe.main_img = reader.result as string;
	};
	reader.readAsDataURL(file);
}

</script>
<template>
	<div class="max-w-[1200px] mx-auto px-4 py-8">
		<div class="flex items-center max-w-fit p-2 m-4 cursor-pointer" @click="$router.back()">
			<svg class="inline-block" width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="white">
				<path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
			</svg>
			<span class="ml-2">Back</span>
		</div>
		<div class="grid grid-cols-3 gap-6">
			<div class="col-span-1 p-4 bg-zinc-800 rounded-2xl">
				<div class="group overflow-hidden relative h-40 rounded-3xl bg-primary mb-4">
					<div>
						<img
							v-if="recipe.main_img.length > 0"
							:src="recipe.main_img"
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-auto"/>
						<div
							v-else
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-zinc-900"
						/>
					</div>
					<div
						class="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity duration-200 pointer-events-none"
						:class="recipe.main_img.length > 0 ? 'opacity-0' : 'opacity-100'"
					>
						<div class="absolute inset-0 bg-zinc-900 opacity-60" />
						<span class="relative text-white text-opacity-80 text-center">
							Click or drag & drop your image
						</span>
					</div>
					<div class="absolute top-0 left-0 w-full h-full">
						<input
							class="h-40 w-full text-transparent cursor-pointer"
							type="file"
							@change="onImageChange"
							accept="image/*"
						/>
					</div>
				</div>
				<div class="mb-2">
					<h5 class="text-lg mb-1">Recipe name</h5>
					<input v-model="recipe.name" type="text" class="w-full rounded-sm p-1 px-2 border border-neutral-700" placeholder="Name" />
				</div>
				<div class="mb-2">
					<h5 class="text-lg mb-1">Servings</h5>
					<NumberFieldRoot
						:min="1"
						:default-value="1"
						:max="1000"
						v-model="recipe.servings"
						class="max-w-fit">
							<div class="mt-1 flex items-center border border-neutral-700 bg-zinc-800 rounded-sm">
								<NumberFieldDecrement class="cursor-pointer px-3 disabled:opacity-20">
									-
								</NumberFieldDecrement>
								<NumberFieldInput class="bg-transparent w-12 text-center focus:outline-0 p-1" />
								<NumberFieldIncrement class="cursor-pointer px-3 disabled:opacity-20">
									+
								</NumberFieldIncrement>
							</div>
					</NumberFieldRoot>
				</div>
				<div>
					<h5 class="text-lg mb-1">Ingredients</h5>
					<VueDraggable v-model="recipe.ingredientBlocks" handle=".handle">
						<div v-for="(ingredientBlock, index) in recipe.ingredientBlocks" :key="ingredientBlock.id" class="border border-neutral-700 rounded-sm p-4 mb-4">
							<div class="flex gap-4">
								<div class="handle">
									<svg class="w-5" viewBox="0 0 15 25">
										<circle cx="2.8125" cy="2.8125" r="2.8125" fill="#737373" />
										<circle cx="2.8125" cy="12.1875" r="2.8125" fill="#737373" />
										<circle cx="2.8125" cy="21.5625" r="2.8125" fill="#737373" />
										<circle cx="12.1875" cy="2.8125" r="2.8125" fill="#737373" />
										<circle cx="12.1875" cy="12.1875" r="2.8125" fill="#737373" />
										<circle cx="12.1875" cy="21.5625" r="2.8125" fill="#737373" />
									</svg>
								</div>
								<div>
									<span class="text-xl text-neutral-500">{{ (index + 1 < 10 ? "0" : "") + (index + 1) }}</span>
								</div>
								<div class="flex-1">
									<input type="text" v-model="ingredientBlock.name" class="w-full text-lg rounded-sm p-2 px-2 mb-2 border border-neutral-700" placeholder="Title" />
									<div>
										<input v-for="ingredient in ingredientBlock.ingredients" v-model="ingredient.name" type="text" class="w-full rounded-sm p-1 px-2 mb-2 border border-neutral-700" placeholder="Ingredient" />
									</div>
									<div>
										<button @click="addIngredient(ingredientBlock)" class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all">+ Add ingredient</button>
									</div>
								</div>
							</div>
						</div>
					</VueDraggable>
					<button @click="addIngredientBlock" class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all">+ Add column</button>
				</div>
			</div>
			<div class="col-span-2 p-4 bg-zinc-800 rounded-2xl">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-2xl mb-2">Steps</h2>
					<button @click="editRecipe" class="flex gap-1 border border-neutral-700 p-2 rounded-3xl cursor-pointer hover:bg-neutral-800 transition-all">
						<svg class="w-5" viewBox="0 0 640 640" fill="white">
							<path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z"/>
						</svg>
						Edit
					</button>
				</div>
				<VueDraggable v-model="recipe.steps" handle=".handle">
					<div v-for="(step, index) in recipe.steps" :key="step.id" class="border border-neutral-700 rounded-sm mb-4">
						<div class="flex gap-4 p-4 mb-4">
							<div class="handle">
								<svg class="w-5" viewBox="0 0 15 25">
									<circle cx="2.8125" cy="2.8125" r="2.8125" fill="#737373" />
									<circle cx="2.8125" cy="12.1875" r="2.8125" fill="#737373" />
									<circle cx="2.8125" cy="21.5625" r="2.8125" fill="#737373" />
									<circle cx="12.1875" cy="2.8125" r="2.8125" fill="#737373" />
									<circle cx="12.1875" cy="12.1875" r="2.8125" fill="#737373" />
									<circle cx="12.1875" cy="21.5625" r="2.8125" fill="#737373" />
								</svg>
							</div>
							<div>
								<span class="text-xl text-neutral-500">{{ (index + 1 < 10 ? "0" : "") + (index + 1) }}</span>
							</div>
							<div class="w-full">
								<input v-model="step.name" type="text" class="w-full rounded-sm p-1 px-2 mb-2 border border-neutral-700" placeholder="Title" />
								<textarea
									v-model="step.instructions"
									v-autoresize
									class="w-full rounded-sm p-1 px-2 border border-neutral-700 overflow-hidden resize-none"
									placeholder="Instructions">
								</textarea>
							</div>
						</div>
					</div>
				</VueDraggable>
				<button @click="addStep" class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all">+ Add step</button>
			</div>
		</div>
	</div>
</template>
