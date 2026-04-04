<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import type {
	EditIngredientBlock,
	EditRecipe,
	ImportRecipeResponse,
} from "~/schemas/recipe/editRecipeSchema";
import { ToastType } from "~/types/toast";

const { showToast } = useToast();

definePageMeta({
	middleware: ["auth"],
	title: "Create Recipe | Cooksy",
	description: "Create a new recipe on Cooksy",
});

useHead({
	title: "Create Recipe | Cooksy",
});

const recipe = reactive<EditRecipe>({
	name: "",
	servings: 1,
	main_img: "",
	ingredientBlocks: [
		{
			name: "",
			order: 0,
			ingredients: [
				{
					name: "",
				},
			],
		},
	],
	steps: [
		{
			name: "",
			order: 0,
			instructions: "",
		},
	],
});

const importModalIsOpen = ref(false);
const isImporting = ref(false);
const importUrl = ref("");

async function createRecipe() {
	recipe.ingredientBlocks?.forEach((block) => {
		block.ingredients = block.ingredients.filter((ingredient) =>
			ingredient.name?.trim(),
		);
	});

	const filteredIngredientBlocks = recipe.ingredientBlocks?.filter(
		(block) => block.name?.trim() || block.ingredients.length > 0,
	);
	recipe.ingredientBlocks =
		filteredIngredientBlocks.length > 0
			? filteredIngredientBlocks
			: [recipe.ingredientBlocks[0]];

	const filteredSteps = recipe.steps.filter(
		(step) => step.name?.trim() || step.instructions?.trim(),
	);
	recipe.steps = filteredSteps.length > 0 ? filteredSteps : [recipe.steps[0]];

	if (recipe.main_img.includes("data:image/")) {
		const uploadResponse = await $fetch("/api/image/upload", {
			method: "POST",
			body: {
				base64Img: recipe.main_img,
			},
		});

		recipe.main_img = uploadResponse.imageUrl;
	}

	try {
		await $fetch(`/api/recipes`, {
			method: "POST",
			body: recipe,
		});

		showToast("Recipe created", ToastType.Success);

		return navigateTo("/");
	} catch (error: any) {
		return showToast(error.statusMessage, ToastType.Error);
	}
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

function addIngredient(ingredientBlock: EditIngredientBlock) {
	ingredientBlock.ingredients.push({
		name: "",
	});
}

function addIngredientBlock() {
	recipe.ingredientBlocks.push({
		name: "",
		order: 0,
		ingredients: [{ name: "" }],
	});
}

function addStep() {
	recipe.steps.push({
		name: "",
		order: 0,
		instructions: "",
	});
}

function mergeImportedRecipe(importedRecipe: Partial<EditRecipe>) {
	if (importedRecipe.name?.trim()) {
		recipe.name = importedRecipe.name.trim();
	}

	if (importedRecipe.servings && importedRecipe.servings > 0) {
		recipe.servings = importedRecipe.servings;
	}

	if (importedRecipe.main_img?.trim()) {
		recipe.main_img = importedRecipe.main_img.trim();
	}

	if (importedRecipe.ingredientBlocks?.length) {
		recipe.ingredientBlocks = importedRecipe.ingredientBlocks.map(
			(block, blockIndex) => ({
				name: block.name,
				order: blockIndex,
				ingredients: block.ingredients.map((ingredient) => ({
					name: ingredient.name,
				})),
			}),
		);
	}

	if (importedRecipe.steps?.length) {
		recipe.steps = importedRecipe.steps.map((step, stepIndex) => ({
			name: step.name,
			instructions: step.instructions,
			order: stepIndex,
		}));
	}
}

async function importRecipeFromUrl() {
	if (!importUrl.value.trim()) {
		return;
	}

	isImporting.value = true;

	try {
		const importResponse = await $fetch<ImportRecipeResponse>(
			"/api/recipes/import",
			{
				method: "POST",
				body: {
					url: importUrl.value.trim(),
				},
			},
		);

		mergeImportedRecipe(importResponse.recipe);
		showToast("Recipe imported", ToastType.Success);

		importModalIsOpen.value = false;
	} catch (error: any) {
		if (error?.statusCode === 429) {
			showToast(
				error.statusMessage ?? "Gemini rate limit reached",
				ToastType.Error,
			);
		} else {
			showToast(
				error?.statusMessage ?? "Could not import recipe from this URL",
				ToastType.Error,
			);
		}
	} finally {
		isImporting.value = false;
	}
}
</script>
<template>
	<div class="max-w-[1200px] mx-auto px-4 pb-8">
		<div
			class="flex items-center max-w-fit p-2 m-4 sm:ml-4 ml-0 cursor-pointer"
			@click="$router.back()"
		>
			<svg
				class="inline-block"
				width="20px"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 448 512"
				fill="white"
			>
				<path
					d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
				/>
			</svg>
			<span class="ml-2">Back</span>
		</div>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 gap-x-0 lg:gap-x-6">
			<div class="col-span-1 p-4 bg-zinc-800 rounded-2xl">
				<div
					class="group overflow-hidden relative h-40 rounded-3xl bg-primary mb-4"
				>
					<div>
						<img
							v-if="recipe.main_img.length > 0"
							:src="recipe.main_img"
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-auto"
						/>
						<div
							v-else
							class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-zinc-900"
						/>
					</div>
					<div
						class="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity duration-200 pointer-events-none"
						:class="
							recipe.main_img.length > 0
								? 'opacity-0'
								: 'opacity-100'
						"
					>
						<div class="absolute inset-0 bg-zinc-900 opacity-60" />
						<span
							class="relative text-white text-opacity-80 text-center"
						>
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
				<div class="lg:hidden mb-2 flex flex-col md:flex-row gap-2">
					<button
						@click="importModalIsOpen = true"
						class="flex items-center justify-center gap-1 border border-neutral-700 p-2 rounded-3xl cursor-pointer hover:bg-neutral-800 transition-all md:flex-1"
					>
						<svg class="w-5" viewBox="0 0 640 640" fill="white">
							<path
								d="M320 96C337.7 96 352 110.3 352 128L352 336L416 336C428.9 336 440.5 343.8 445.4 355.8C450.3 367.8 447.4 381.6 438.2 390.8L342.2 486.8C329.7 499.3 309.4 499.3 296.9 486.8L200.9 390.8C191.7 381.6 188.8 367.8 193.7 355.8C198.6 343.8 210.2 336 223.1 336L288 336L288 128C288 110.3 302.3 96 320 96zM128 448C145.7 448 160 462.3 160 480L160 512L480 512L480 480C480 462.3 494.3 448 512 448C529.7 448 544 462.3 544 480L544 512C544 547.3 515.3 576 480 576L160 576C124.7 576 96 547.3 96 512L96 480C96 462.3 110.3 448 128 448z"
							/>
						</svg>
						Import recipe
					</button>
					<button
						@click="createRecipe"
						class="flex justify-center gap-1 border border-neutral-700 p-2 rounded-3xl cursor-pointer hover:bg-neutral-800 transition-all md:flex-1"
					>
						<svg class="w-5" viewBox="0 0 640 640" fill="white">
							<path
								d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z"
							/>
						</svg>
						Save
					</button>
				</div>
				<div class="mb-2">
					<h5 class="text-lg mb-1">Recipe name</h5>
					<input
						v-model="recipe.name"
						type="text"
						class="w-full rounded-sm p-1 px-2 border border-neutral-700"
						placeholder="Name"
					/>
				</div>
				<div class="mb-2">
					<h5 class="text-lg mb-1">Servings</h5>
					<NumberFieldRoot
						:min="1"
						:default-value="1"
						:max="1000"
						v-model="recipe.servings"
						class="max-w-fit"
					>
						<div
							class="mt-1 flex items-center border border-neutral-700 bg-zinc-800 rounded-sm"
						>
							<NumberFieldDecrement
								class="cursor-pointer px-3 disabled:opacity-20"
							>
								-
							</NumberFieldDecrement>
							<NumberFieldInput
								class="bg-transparent w-12 text-center focus:outline-0 p-1"
							/>
							<NumberFieldIncrement
								class="cursor-pointer px-3 disabled:opacity-20"
							>
								+
							</NumberFieldIncrement>
						</div>
					</NumberFieldRoot>
				</div>
				<div>
					<h5 class="text-lg mb-1">Ingredients</h5>
					<VueDraggable
						v-model="recipe.ingredientBlocks"
						handle=".handle"
					>
						<div
							v-for="(
								ingredientBlock, index
							) in recipe.ingredientBlocks"
							:key="ingredientBlock.id"
							class="border border-neutral-700 rounded-sm p-4 mb-4"
						>
							<div class="flex flex-wrap sm:flex-nowrap gap-4">
								<div class="handle">
									<svg class="w-5" viewBox="0 0 15 25">
										<circle
											cx="2.8125"
											cy="2.8125"
											r="2.8125"
											fill="#737373"
										/>
										<circle
											cx="2.8125"
											cy="12.1875"
											r="2.8125"
											fill="#737373"
										/>
										<circle
											cx="2.8125"
											cy="21.5625"
											r="2.8125"
											fill="#737373"
										/>
										<circle
											cx="12.1875"
											cy="2.8125"
											r="2.8125"
											fill="#737373"
										/>
										<circle
											cx="12.1875"
											cy="12.1875"
											r="2.8125"
											fill="#737373"
										/>
										<circle
											cx="12.1875"
											cy="21.5625"
											r="2.8125"
											fill="#737373"
										/>
									</svg>
								</div>
								<div>
									<span class="text-xl text-neutral-500">{{
										(index + 1 < 10 ? "0" : "") +
										(index + 1)
									}}</span>
								</div>
								<div class="w-full">
									<input
										type="text"
										v-model="ingredientBlock.name"
										class="w-full text-lg rounded-sm p-2 px-2 mb-2 border border-neutral-700"
										placeholder="Title"
									/>
									<div>
										<input
											v-for="ingredient in ingredientBlock.ingredients"
											v-model="ingredient.name"
											type="text"
											class="w-full rounded-sm p-1 px-2 mb-2 border border-neutral-700"
											placeholder="Ingredient"
										/>
									</div>
									<div>
										<button
											@click="
												addIngredient(ingredientBlock)
											"
											class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all"
										>
											+ Add ingredient
										</button>
									</div>
								</div>
							</div>
						</div>
					</VueDraggable>
					<button
						@click="addIngredientBlock"
						class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all"
					>
						+ Add column
					</button>
				</div>
			</div>
			<div class="col-span-2 p-4 bg-zinc-800 rounded-2xl">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-2xl mb-2">Steps</h2>
					<div class="lg:flex hidden gap-2">
						<button
							@click="importModalIsOpen = true"
							class="flex items-center gap-1 border border-neutral-700 p-2 rounded-3xl cursor-pointer hover:bg-neutral-800 transition-all"
						>
							<svg class="w-5" viewBox="0 0 640 640" fill="white">
								<path
									d="M320 96C337.7 96 352 110.3 352 128L352 336L416 336C428.9 336 440.5 343.8 445.4 355.8C450.3 367.8 447.4 381.6 438.2 390.8L342.2 486.8C329.7 499.3 309.4 499.3 296.9 486.8L200.9 390.8C191.7 381.6 188.8 367.8 193.7 355.8C198.6 343.8 210.2 336 223.1 336L288 336L288 128C288 110.3 302.3 96 320 96zM128 448C145.7 448 160 462.3 160 480L160 512L480 512L480 480C480 462.3 494.3 448 512 448C529.7 448 544 462.3 544 480L544 512C544 547.3 515.3 576 480 576L160 576C124.7 576 96 547.3 96 512L96 480C96 462.3 110.3 448 128 448z"
								/>
							</svg>
							Import recipe
						</button>
						<button
							@click="createRecipe"
							class="flex gap-1 border border-neutral-700 p-2 rounded-3xl cursor-pointer hover:bg-neutral-800 transition-all"
						>
							<svg class="w-5" viewBox="0 0 640 640" fill="white">
								<path
									d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z"
								/>
							</svg>
							Save
						</button>
					</div>
				</div>
				<VueDraggable v-model="recipe.steps" handle=".handle">
					<div
						v-for="(step, index) in recipe.steps"
						:key="step.id"
						class="border border-neutral-700 rounded-sm mb-4"
					>
						<div
							class="flex flex-wrap sm:flex-nowrap gap-4 p-4 mb-4"
						>
							<div class="handle">
								<svg class="w-5" viewBox="0 0 15 25">
									<circle
										cx="2.8125"
										cy="2.8125"
										r="2.8125"
										fill="#737373"
									/>
									<circle
										cx="2.8125"
										cy="12.1875"
										r="2.8125"
										fill="#737373"
									/>
									<circle
										cx="2.8125"
										cy="21.5625"
										r="2.8125"
										fill="#737373"
									/>
									<circle
										cx="12.1875"
										cy="2.8125"
										r="2.8125"
										fill="#737373"
									/>
									<circle
										cx="12.1875"
										cy="12.1875"
										r="2.8125"
										fill="#737373"
									/>
									<circle
										cx="12.1875"
										cy="21.5625"
										r="2.8125"
										fill="#737373"
									/>
								</svg>
							</div>
							<div>
								<span class="text-xl text-neutral-500">{{
									(index + 1 < 10 ? "0" : "") + (index + 1)
								}}</span>
							</div>
							<div class="w-full">
								<input
									v-model="step.name"
									type="text"
									class="w-full rounded-sm p-1 px-2 mb-2 border border-neutral-700"
									placeholder="Title"
								/>
								<textarea
									v-model="step.instructions"
									v-autoresize
									class="w-full rounded-sm p-1 px-2 border border-neutral-700 overflow-hidden"
									placeholder="Instructions"
								/>
							</div>
						</div>
					</div>
				</VueDraggable>
				<button
					@click="addStep"
					class="w-full border border-indigo-700 p-2 py-1 rounded-sm hover:bg-indigo-700 cursor-pointer transition-all"
				>
					+ Add step
				</button>
			</div>
			<Modal v-model:open="importModalIsOpen">
				<DialogTitle class="text-lg font-semibold">
					Import Recipe URL
				</DialogTitle>

				<DialogDescription>
					Paste a recipe URL and Cooksy will import the recipe with
					Gemini
				</DialogDescription>

				<div class="mt-4">
					<input
						v-model="importUrl"
						type="url"
						class="w-full rounded-sm p-2 border border-neutral-700"
						placeholder="https://example.com/recipe"
					/>
				</div>

				<div class="mt-4 flex justify-end gap-2">
					<DialogClose as-child>
						<button
							class="cursor-pointer border border-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-800"
						>
							Cancel
						</button>
					</DialogClose>
					<button
						@click="importRecipeFromUrl"
						:disabled="isImporting"
						class="inline-flex items-center justify-center gap-2 cursor-pointer border border-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						<svg
							v-if="isImporting"
							class="w-4 h-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="3"
								class="opacity-25"
							/>
							<path
								d="M22 12a10 10 0 0 0-10-10"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								class="opacity-90"
							/>
						</svg>
						<span>{{
							isImporting ? "Importing..." : "Import"
						}}</span>
					</button>
				</div>
			</Modal>
		</div>
	</div>
</template>
