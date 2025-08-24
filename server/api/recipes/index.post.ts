import prisma from "~/lib/prisma";

import { EditRecipe, editRecipeSchema } from "~/schemas/recipe/editRecipeSchema";

export default defineEventHandler(async (event) => {
	await auth(event);

	const body = await readBody(event);
	const parsedRecipe = editRecipeSchema.safeParse(body);

	if (!parsedRecipe.success) {
		const firstParseError = parsedRecipe.error.issues[0];
		console.error(parsedRecipe.error.issues);

		throw createError({
			statusCode: 400,
			statusMessage: firstParseError.message
		});
	}

	const recipe: EditRecipe = parsedRecipe.data;

	await prisma.recipe.create({
		data: {
			name: recipe.name,
			servings: recipe.servings,
			main_img: recipe.main_img,
			steps: {
				create: recipe.steps.map((step, index) => ({
					name: step.name,
					instructions: step.instructions,
					order: index,
				})),
			},
			ingredientBlocks: {
				create: recipe.ingredientBlocks.map((block, index) => ({
					name: block.name,
					order: index,
					ingredients: {
						create: block.ingredients.map((ingredient) => ({
							name: ingredient.name,
						})),
					},
				})),
			},
		},
	});
});
