import { getAllRecipesAction } from "@/actions/recipe";
import "./page.scss";

export const revalidate = 10;

export default async function Home() {
	let recipes = (await getAllRecipesAction()).data;

	return (
		<main>
			<div className="recipes">
				{recipes.map((recipe) => (
					<div className="recipe" key={recipe.id}>
						<img src="/img/katsudon.jpg" />
						<h5>{recipe.name}</h5>
					</div>
				))}
			</div>
		</main>
	);
}
