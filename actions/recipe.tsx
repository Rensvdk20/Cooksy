import RecipeResponse from "@/schemas/recipeResponse";
import { createClient } from "@/utils/auth/server";

const supabase = createClient();

export async function getAllRecipesAction(): Promise<RecipeResponse> {
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
