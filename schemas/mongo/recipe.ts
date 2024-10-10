import { model, models, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Ingredient, IngredientBlock, Recipe, Steps } from "../recipe";

const IngredientSchema = new Schema<Ingredient>({
	name: String
});

const IngredientBlockSchema = new Schema<IngredientBlock>({
	id: {
		type: String,
		default: uuidv4,
		index: true,
		required: false
	},
	name: String,
	ingredient: [IngredientSchema]
});

const StepSchema = new Schema<Steps>({
	id: {
		type: String,
		default: uuidv4,
		index: true,
		required: false
	},
	name: String,
	instructions: String
});

const RecipeSchema = new Schema<Recipe>({
	id: {
		type: String,
		default: uuidv4,
		index: true,
		required: false
	},
	name: String,
	servings: Number,
	ingredient_block: [IngredientBlockSchema],
	steps: [StepSchema],
	created_at: Date,
	created_by: String
});

const RecipeModel = models.Recipe || model<Recipe>("Recipe", RecipeSchema);
export default RecipeModel;
