import Recipe from "./recipe";

export default interface RecipeResponse {
	status: number;
	message: string;
	data: Recipe[];
}
