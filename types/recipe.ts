export interface Recipe {
	id: string
	name: string
	servings: number
	main_img: string
	ingredientBlocks: IngredientBlock[]
	steps: Step[]
	created_at: string
	updated_at: string
}

export interface IngredientBlock {
	id: string
	name: string
	ingredients: Ingredient[]
}

export interface Ingredient {
	id: string
	name: string
}

export interface Step {
	id: string
	name: string
	instructions: string
}
