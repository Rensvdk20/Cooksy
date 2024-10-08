import { getAllRecipesAction } from "@/actions/recipe";
import "./page.scss";
import Link from "next/link";

export const revalidate = 10;

export default async function Home() {
	let recipes = (await getAllRecipesAction()).data;

	return (
		<main>
			<div className="recipes">
				{recipes.map((recipe) => (
					<Link href={`/recipe/${recipe.id}/edit`} key={recipe.id}>
						<div className="recipe">
							<img src="/img/katsudon.jpg" />
							<h5>{recipe.name}</h5>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}
