"use server";

import { Recipe, RecipeResponse, RecipesResponse } from "@/schemas/recipe";
import { createClient } from "@/utils/auth/server";

export async function getAllRecipesAction(): Promise<RecipesResponse> {
	const supabase = createClient();
	const { data: recipes, error } = await supabase.from("recipe").select();

	if (error) {
		console.error("Error fetching data:", error);
		return {
			status: 500,
			message: error.message,
			data: []
		};
	}

	return {
		status: 200,
		message: "Recipes received",
		data: recipes
	};
}

export async function getRecipeByIdAction(id: string): Promise<RecipeResponse> {
	const supabase = createClient();
	const { data: recipe, error } = await supabase.from("recipe").select().eq("id", id).single();

	if (error) {
		console.error("Error fetching data:", error);
		return {
			status: 500,
			message: error.message
		};
	}

	return {
		status: 200,
		message: "Recipe received",
		data: recipe
	};
}

export async function getFullRecipeByIdAction(id: string): Promise<RecipeResponse> {
	const supabase = createClient();
	const { data: recipe, error } = await supabase
		.from("recipe")
		.select(
			`
			id,
			name,
			servings,
			created_at,
			created_by,
			ingredient_block(
				id,
				name,
				order,
				created_at,
				ingredient(
					id,
					name
				)
			)
			`
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching data:", error);
		return {
			status: 500,
			message: error.message
		};
	}

	return {
		status: 200,
		message: "Recipe received",
		data: recipe
	};
}

export async function editRecipeAction(recipe: Recipe): Promise<RecipeResponse> {
	const supabase = createClient();
	const { error } = await supabase
		.from("recipe")
		.update({
			name: recipe.name,
			servings: recipe.servings,
			created_at: recipe.created_at,
			created_by: recipe.created_by
		})
		.eq("id", recipe.id);

	if (error) {
		console.error("Error updating data:", error);
		return {
			status: 500,
			message: error.message
		};
	}

	return {
		status: 200,
		message: "Recipe updated"
	};
}
