import { getAllRecipesAction } from "@/actions/recipe";
import Link from "next/link";
import { IoAddCircleOutline } from "react-icons/io5";

import "./page.scss";

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
				<div>
					<Link href={"/recipe"} className="recipe recipe-placeholder">
						<IoAddCircleOutline size={60} />
					</Link>
				</div>
			</div>
		</main>
	);
}
