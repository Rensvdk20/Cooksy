import prisma from "~/lib/prisma";

export default defineEventHandler(() => {
	return prisma.recipe.findMany({
        orderBy: {
            created_at: "asc"
        }
    });
});
