import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Recipe id is required'
		});
	}

	const recipe = await prisma.recipe.findUnique({
		where: { id },
		include: {
			ingredientBlocks: {
				include: {
					ingredients: true
				}
			},
			steps: true
		}
	});

	if (!recipe) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Recipe not found'
		});
	}

	return recipe;
});
