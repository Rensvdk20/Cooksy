import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
	await auth(event);

	const id = event.context.params?.id;
	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Recipe id is required'
		});
	}

	const foundRecipe = await prisma.recipe.findUnique({
		where: { id }
	});

	if (!foundRecipe) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Recipe not found'
		});
	}

	await prisma.recipe.delete({
		where: { id }
	});
});
