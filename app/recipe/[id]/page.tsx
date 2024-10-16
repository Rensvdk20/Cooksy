import { getRecipeByIdAction } from "@/actions/recipe";
import { FaUser } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import type { Recipe } from "@/schemas/recipe";

import "./page.scss";
import Link from "next/link";

export default async function Recipe({ params }: { params: { id: string } }) {
	const recipe = (await getRecipeByIdAction(params.id)).data as Recipe;

	return (
		<div className="recipe">
			<div className="banner">
				<img src={process.env.CLOUDINARY_IMG_URL! + recipe.img} />
				<h1>{recipe.name}</h1>
				<Link href={`/recipe/${recipe.id}/edit`} className="btn btn-secondary">
					<MdEdit size={15} />
					Edit
				</Link>
			</div>
			<div className="recipe-info">
				<div className="ingredients">
					<div className="ingredients-header">
						<h2>Ingredients</h2>
						<div className="ingredients-servings">
							<FaUser size={22} />
							<span>{recipe.servings}</span>
						</div>
					</div>
					{recipe.ingredient_block &&
						recipe.ingredient_block.map((ingredient_block, index) => (
							<div key={index} className="ingredients-column">
								<h3>{ingredient_block.name}</h3>
								<ul>
									{ingredient_block.ingredient &&
										ingredient_block.ingredient.map((ingredient, index) => (
											<div key={index} className="ingredient">
												<input type="checkbox" />
												<li key={index}>{ingredient.name}</li>
											</div>
										))}
								</ul>
							</div>
						))}
				</div>
				<div className="steps">
					{recipe.steps &&
						recipe.steps.map((step, index) => (
							<div className="step" key={index}>
								<h2>{step.name}</h2>
								<p>{step.instructions}</p>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
