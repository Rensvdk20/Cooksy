"use client";

import { getAllRecipesAction } from "@/actions/recipe";
import Link from "next/link";
import { IoAddCircleOutline } from "react-icons/io5";

import "./page.scss";
import { CldImage } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Recipe } from "@/schemas/recipe";

export default function Home() {
	const [recipes, setRecipes] = useState<Recipe[] | null>([]);

	async function getRecipes() {
		const response = await getAllRecipesAction();

		if (response.status === 200 && response.data) {
			setRecipes(response.data);
		}
	}

	useEffect(() => {
		getRecipes();
	}, []);

	return (
		<main>
			{recipes && recipes.length > 0 && (
				<div className="recipes">
					{recipes.map((recipe) => (
						<Link href={`/recipe/${recipe.id}/edit`} key={recipe.id}>
							<div className="recipe">
								{recipe.img ? (
									<CldImage
										src={recipe.img}
										alt="Recipe image"
										width={340}
										height={150}
										loading="eager"
									/>
								) : (
									<img src="/img/katsudon.jpg" alt="Recipe Image" />
								)}
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
			)}
		</main>
	);
}
