import { z } from 'zod';

export const ingredientSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty("Ingredient name is required").max(100),
});

export const ingredientBlockSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty("Ingredient column name is required").max(100),
	ingredients: z.array(ingredientSchema),
});

export const stepSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty("Step name is required").max(100),
	instructions: z.string().nonempty("Instructions are required"),
});

export const recipeSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty("Recipe name is required").max(100),
	servings: z.number().int().positive().max(1000),
	main_img: z.string().url().max(1000),
	ingredientBlocks: z.array(ingredientBlockSchema),
	steps: z.array(stepSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type IngredientBlock = z.infer<typeof ingredientBlockSchema>;
export type Step = z.infer<typeof stepSchema>;
export type Recipe = z.infer<typeof recipeSchema>
