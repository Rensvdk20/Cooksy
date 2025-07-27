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
		console.error(parsedRecipe.error.issues);

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
		await tx.recipe.update({
			where: { id },
			data: {
				name: recipe.name,
				servings: recipe.servings,
				main_img: recipe.main_img,
			},
		});

		if (recipe.ingredientBlocks) {
			for (const block of recipe.ingredientBlocks) {
				await tx.ingredientBlock.upsert({
					where: { id: block.id || '' },
					update: {
						name: block.name,
						ingredients: {
							deleteMany: {},
							create: block.ingredients.map((ingredient) => ({
								name: ingredient.name,
							})),
						},
					},
					create: {
						name: block.name,
						recipeId: id,
						ingredients: {
							create: block.ingredients.map((ingredient) => ({
								id: ingredient.id,
								name: ingredient.name,
							})),
						},
					},
				});
			}
		}

		if (recipe.steps) {
			await tx.step.deleteMany({
				where: { recipeId: id }
			});

			if (recipe.steps.length > 0) {
				await tx.step.createMany({
					data: recipe.steps.map(step => ({
						name: step.name,
						instructions: step.instructions,
						recipeId: id,
					})),
				});
			}
		}
	});
});
