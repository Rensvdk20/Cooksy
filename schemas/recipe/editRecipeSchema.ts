import { z } from 'zod';

export const editIngredientSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().max(100),
});

export const editIngredientBlockSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().nonempty("Ingredient column name is required").max(100),
	ingredients: z.array(editIngredientSchema),
});

export const editStepSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().nonempty("Step name is required").max(100),
	instructions: z.string(),
});

export const editRecipeSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().nonempty("Recipe name is required").max(100),
	servings: z.number().int().positive().max(1000),
	main_img: z.string().url().max(1000),
	ingredientBlocks: z.array(editIngredientBlockSchema),
	steps: z.array(editStepSchema),
});

export type EditIngredient = z.infer<typeof editIngredientSchema>;
export type EditIngredientBlock = z.infer<typeof editIngredientBlockSchema>;
export type EditStep = z.infer<typeof editStepSchema>;
export type EditRecipe = z.infer<typeof editRecipeSchema>;
