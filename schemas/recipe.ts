export interface Recipe {
	id?: string;
	name: string;
	servings: number;
	ingredient_block?: IngredientBlock[];
	steps?: Steps[];
	created_at: Date;
	created_by: string;
}

export interface IngredientBlock {
	id: string;
	name: string;
	order: number;
	// created_at: Date;
	ingredient?: Ingredient[];
}

export interface Ingredient {
	id?: string;
	name: string;
}

export interface Steps {
	id: string;
	name: string;
	instructions: string;
	order: number;
}

export interface RecipeResponse {
	status: number;
	message: string;
	data?: Recipe;
}

export interface RecipesResponse {
	status: number;
	message: string;
	data: Recipe[];
}
