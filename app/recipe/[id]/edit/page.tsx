"use client";

import { useState, useRef, useEffect } from "react";
import type { Ingredient, IngredientBlock, Recipe } from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import "./edit.scss";

import { RiDraggable, RiSave2Fill } from "react-icons/ri";
import { ReactSortable } from "react-sortablejs";
import { editRecipeAction, getFullRecipeByIdAction } from "@/actions/recipe";

export default function Recipe({ params }: { params: { id: string } }) {
	const [recipe, setRecipe] = useState<Recipe | null>(null);

	async function getRecipeById(id: string) {
		const response = await getFullRecipeByIdAction(id);

		if (response.status === 200 && response.data) {
			console.log(response.data);
			setRecipe(response.data);
		}
	}

	useEffect(() => {
		getRecipeById(params.id);
	}, []);

	function increaseServings() {
		if (recipe) setRecipe({ ...recipe, servings: recipe.servings + 1 });
	}

	function decreaseServings() {
		if (recipe) setRecipe({ ...recipe, servings: recipe.servings - 1 });
	}

	function addIngredientBlock() {
		if (recipe) {
			const newIngredientBlock = {
				id: uuidv4(),
				name: "",
				order: 0,
				created_at: new Date(),
				ingredient: []
			} as IngredientBlock;

			setRecipe({
				...recipe,
				ingredient_block: [...(recipe.ingredient_block || []), newIngredientBlock]
			});
		}
	}

	function addIngredient(ingredientBlockId: string) {
		if (recipe && recipe.ingredient_block) {
			const newIngredient = {
				id: uuidv4(),
				name: "",
				created_at: new Date(),
				created_by: ""
			} as Ingredient;

			setRecipe({
				...recipe,
				ingredient_block: recipe.ingredient_block.map((ingredientBlock) => {
					if (ingredientBlock.id === ingredientBlockId) {
						ingredientBlock.ingredient?.push(newIngredient);
					}
					return ingredientBlock;
				})
			});
		}
	}

	async function editRecipe() {
		if (recipe) {
			console.log(recipe);
			const response = await editRecipeAction(recipe);
			console.log(response);
		}
	}

	if (recipe !== null) {
		return (
			<div className="recipe-edit">
				<div className="recipe-edit-info">
					<div className="recipe-img">
						<img src="/img/katsudon.jpg" alt="Recipe Image" />
					</div>

					<div className="recipe-name">
						<h3>Recipe Name</h3>
						<input
							type="text"
							id="name"
							value={recipe.name}
							onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
						/>
					</div>

					<div className="recipe-servings">
						<h3>Servings</h3>
						<div className="counter">
							<input
								type="number"
								id="servings"
								onChange={(e) =>
									setRecipe({ ...recipe, servings: parseInt(e.target.value) })
								}
								value={recipe.servings}
							/>
							<div className="btn counter-btn" onClick={increaseServings}>
								+
							</div>
							<div className="btn counter-btn" onClick={decreaseServings}>
								-
							</div>
						</div>
					</div>

					<h3>Columns</h3>
					<ReactSortable
						group="columns"
						handle=".column-draggable-icon"
						// animation={150}
						list={recipe.ingredient_block}
						setList={(newState) => {
							if (recipe) {
								setRecipe({
									...recipe,
									ingredient_block: newState // update only the ingredient_block array
								});
							}
						}}
					>
						{recipe.ingredient_block &&
							recipe.ingredient_block.map((ingredient_block, index) => (
								<div key={ingredient_block.id} className="column">
									<div className="column-draggable">
										<RiDraggable className="column-draggable-icon" size={50} />
									</div>
									<div className="column-order">
										{(index + 1 < 10 ? "0" : "") + (index + 1)}
									</div>
									<div className="column-info">
										<input
											type="text"
											className="column-name"
											placeholder="Name"
											id="column-name"
											value={ingredient_block.name}
											onChange={(e) => {
												if (recipe && recipe.ingredient_block) {
													recipe.ingredient_block[index].name =
														e.target.value;
													setRecipe({ ...recipe });
												}
											}}
										/>
										{recipe.ingredient_block &&
											recipe.ingredient_block[index].ingredient &&
											recipe.ingredient_block[index].ingredient.map(
												(ingredient) => (
													<input
														key={ingredient.id}
														type="text"
														className="column-item"
														placeholder="Item"
														id="column-item"
														value={ingredient.name}
														onChange={(e) => {
															if (recipe) {
																recipe.ingredient_block![
																	index
																].ingredient?.map(
																	(foundIngredient) => {
																		if (
																			ingredient.id ===
																			foundIngredient.id
																		) {
																			ingredient.name =
																				e.target.value;
																		}
																		return ingredient;
																	}
																);
																setRecipe({ ...recipe });
															}
														}}
													/>
												)
											)}
										<button
											className="btn column-item-add"
											onClick={() => addIngredient(ingredient_block.id)}
										>
											+ Add item
										</button>
									</div>
								</div>
							))}
					</ReactSortable>
					<button className="btn column-add" onClick={addIngredientBlock}>
						+ Add column
					</button>

					{/* <div className="column">
					<input
						type="text"
						className="column-name"
						placeholder="Name"
						id="column-name"
					/>
					<input
						type="text"
						className="column-item"
						placeholder="Item"
						id="column-item"
					/>
					<input
						type="text"
						className="column-item"
						placeholder="Item"
						id="column-item"
					/>
					<button className="btn column-item-add">+ Add item</button>
				</div> */}
				</div>
				<div className="recipe-edit-steps">
					<h1>Steps</h1>
					<button onClick={editRecipe} className="btn btn-secondary recipe-edit-save">
						<RiSave2Fill /> Save
					</button>
					<div className="step">
						<div className="step-draggable">
							<RiDraggable className="step-draggable-icon" size={50} />
						</div>
						<div className="step-order">01</div>
						<div className="step-info">
							<input
								type="text"
								className="step-item"
								placeholder="Name"
								id="column-item"
							/>
							<textarea
								className="step-item"
								rows={5}
								placeholder="Instructions"
								id="column-item"
							/>
						</div>
					</div>
					<button className="btn step-add">+ Add step</button>
				</div>
			</div>
		);
	}
}
