"use server";

import RecipeModel from "@/schemas/mongo/recipe";
import { Recipe, RecipeResponse, RecipesResponse } from "@/schemas/recipe";
import mongoConn from "@/utils/auth/mongo/mongoConn";

export async function getAllRecipesAction(): Promise<RecipesResponse> {
	try {
		await mongoConn();
		const recipes = await RecipeModel.find({}, { ingredient_block: 0 });

		if (!recipes) {
			return {
				status: 404,
				message: "Recipes not found",
				data: []
			};
		}

		return {
			status: 200,
			message: "Recipes received",
			data: recipes
		};
	} catch (error: any) {
		console.error("Error fetching data:", error);
		return {
			status: 500,
			message: error.message,
			data: []
		};
	}
}

export async function getRecipeByIdAction(id: string): Promise<RecipeResponse> {
	try {
		await mongoConn();
		const recipe = await RecipeModel.findOne(
			{ id },
			{
				_id: 0,
				ingredient_block: {
					_id: 0,
					ingredient: {
						_id: 0
					}
				}
			}
		).lean();
		console.log(recipe);
		if (!recipe) {
			return {
				status: 404,
				message: "Recipe not found"
			};
		}

		return {
			status: 200,
			message: "Recipe received",
			data: recipe as unknown as Recipe
		};
	} catch (error: any) {
		console.error("Error fetching data:", error);
		return {
			status: 500,
			message: error.message
		};
	}
}

export async function editRecipeAction(recipe: Recipe): Promise<RecipeResponse> {
	try {
		await mongoConn();

		const filteredRecipe = {
			...recipe,
			ingredient_block: recipe.ingredient_block
				?.filter((block) => block.name.trim() !== "") // Filter IngredientBlocks without a name
				.map((block) => ({
					...block,
					ingredient: block.ingredient?.filter((ing) => ing.name.trim() !== "") // Filter Ingredients without a name
				})),
			steps: recipe.steps?.filter(
				(step) => step.name.trim() !== "" || step.instructions.trim() !== "" // Filter Steps without a name & instructions
			)
		};

		await RecipeModel.updateOne({ id: recipe.id }, filteredRecipe);

		return {
			status: 200,
			message: "Recipe updated"
		};
	} catch (error: any) {
		console.error("Error updating data:", error);
		return {
			status: 500,
			message: error.message
		};
	}
}

export async function createRecipeAction(recipe: Recipe): Promise<RecipeResponse> {
	try {
		await mongoConn();
		await RecipeModel.create(recipe);

		return {
			status: 200,
			message: "Recipe created"
		};
	} catch (error: any) {
		console.error("Error creating data:", error);
		return {
			status: 500,
			message: error.message
		};
	}
}
