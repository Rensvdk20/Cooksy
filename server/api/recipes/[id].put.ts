import prisma from "~/lib/prisma";

import { EditRecipe, editRecipeSchema } from "~/schemas/recipe/editRecipeSchema";

export default defineEventHandler(async (event) => {
	await auth(event);

	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Recipe id is required'
		});
	}

	const body = await readBody(event);
	const parsedRecipe = editRecipeSchema.safeParse(body);

	if (!parsedRecipe.success) {

		throw createError({
			statusCode: 400,
			statusMessage: parsedRecipe.error.issues.map(issue => issue.message).join(', ')
		});
	}

	const recipe: EditRecipe = parsedRecipe.data;

	const foundRecipe = await prisma.recipe.findUnique({
		where: { id }
	});

	if(!foundRecipe) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Recipe not found'
		});
	}

	await prisma.$transaction(async (tx) => {
		// ---------------------------
		// Handle Recipe
		// ---------------------------
		await tx.recipe.update({
			where: { id },
			data: {
				name: recipe.name,
				servings: recipe.servings,
				main_img: recipe.main_img,
			},
		});

		// ---------------------------
		// Handle Steps
		// ---------------------------
		const existingSteps = await tx.step.findMany({
			where: { recipeId: id },
			select: { id: true },
		});
		const incomingStepIds = recipe.steps
			?.map(s => s.id)
			.filter((id): id is string => typeof id === "string") ?? [];
		const existingStepIds = existingSteps.map(s => s.id);

		// Delete removed steps
		await tx.step.deleteMany({
			where: {
				recipeId: id,
				NOT: { id: { in: incomingStepIds } },
			},
		});

		// Upsert steps
		for (const step of recipe.steps || []) {
			const order = (recipe.steps?.indexOf(step) ?? 0);

			if (step.id && existingStepIds.includes(step.id)) {
				await tx.step.update({
					where: { id: step.id },
					data: {
						name: step.name,
						instructions: step.instructions,
						order: order,
					},
				});
			} else {
				await tx.step.create({
					data: {
						name: step.name,
						instructions: step.instructions,
						order: order,
						recipeId: id,
					},
				});
			}
		}

		// ---------------------------
		// Handle Ingredient Blocks + Ingredients
		// ---------------------------
		const existingBlocks = await tx.ingredientBlock.findMany({
			where: { recipeId: id },
			include: { ingredients: true },
		});
		const incomingBlockIds = recipe.ingredientBlocks
			?.map(b => b.id)
			.filter((id): id is string => typeof id === "string") ?? [];
		const existingBlockIds = existingBlocks.map(b => b.id);

		// Delete removed blocks
		await tx.ingredientBlock.deleteMany({
			where: {
				recipeId: id,
				NOT: { id: { in: incomingBlockIds } },
			},
		});

		for (const block of recipe.ingredientBlocks || []) {
			const order = (recipe.ingredientBlocks?.indexOf(block) ?? 0);

			if (block.id && existingBlockIds.includes(block.id)) {
				// Update existing block
				await tx.ingredientBlock.update({
					where: { id: block.id },
					data: {
						name: block.name,
						order: order,
					},
				});

				// Compare ingredients
				const dbBlock = existingBlocks.find(b => b.id === block.id);
				const dbIngredientIds = dbBlock?.ingredients.map(i => i.id) ?? [];
				const incomingIngredientIds = block.ingredients
					.map(i => i.id)
					.filter((id): id is string => typeof id === "string");

				// Delete removed ingredients
				await tx.ingredient.deleteMany({
					where: {
						ingredientBlockId: block.id,
						NOT: { id: { in: incomingIngredientIds } },
					},
				});

				// Upsert ingredients
				for (const ingredient of block.ingredients) {
					if (ingredient.id && dbIngredientIds.includes(ingredient.id)) {
						await tx.ingredient.update({
							where: { id: ingredient.id },
							data: { name: ingredient.name },
						});
					} else {
						await tx.ingredient.create({
							data: {
								name: ingredient.name,
								ingredientBlockId: block.id,
							},
						});
					}
				}
			} else {
				// Create new block + ingredients
				await tx.ingredientBlock.create({
					data: {
						name: block.name,
						recipeId: id,
						order: order,
						ingredients: {
							create: block.ingredients.map(ingredient => ({
								name: ingredient.name,
							})),
						},
					},
				});
			}
		}
	});
});
