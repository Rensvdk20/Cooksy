"use client";

import { useState, useEffect } from "react";
import type { Ingredient, IngredientBlock, Recipe } from "@/schemas/recipe";
import { v4 as uuidv4 } from "uuid";
import "./EditRecipe.scss";

import { RiDraggable, RiSave2Fill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import { deleteRecipeAction, editRecipeAction, getRecipeByIdAction } from "@/actions/recipe";
import { CldImage, CldUploadWidget } from "next-cloudinary";

export default function EditRecipe({ params }: { params: { id: string } }) {
	const [recipe, setRecipe] = useState<Recipe | null>(null);

	useEffect(() => {
		getRecipeById(params.id);
	}, []);

	async function getRecipeById(id: string) {
		if (id) {
			const response = await getRecipeByIdAction(id);

			if (response.status === 200 && response.data) {
				console.log(response.data);
				return setRecipe(response.data);
			}
		}

		setRecipe({
			id: uuidv4(),
			name: "",
			servings: 1,
			ingredient_block: [
				{
					id: uuidv4(),
					name: "",
					ingredient: []
				}
			],
			steps: [
				{
					id: uuidv4(),
					name: "",
					instructions: ""
				}
			]
		});
	}

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
				name: ""
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
			const response = await editRecipeAction(recipe);

			if (response.status === 200) {
				console.log("Recipe edited successfully");
			} else {
				console.error("Error editing recipe");
			}
		}
	}

	async function deleteRecipe() {
		if (recipe) {
			const response = await deleteRecipeAction(params.id);

			if (response.status === 200) {
				console.log("Recipe deleted successfully");
			} else {
				console.error("Error deleting recipe");
			}
		}
	}

	function addStep() {
		if (recipe) {
			const newStep = {
				id: uuidv4(),
				name: "",
				instructions: ""
			};

			setRecipe({
				...recipe,
				steps: [...(recipe.steps || []), newStep]
			});
		}
	}

	if (recipe !== null) {
		return (
			<div className="recipe-edit">
				<div className="recipe-edit-info">
					<div className="recipe-img">
						{recipe.img ? (
							<CldImage
								src={recipe.img}
								alt="Recipe image"
								width={340}
								height={150}
								loading="eager"
								priority
							/>
						) : (
							<img src="/img/katsudon.jpg" alt="Recipe Image" />
						)}
						<CldUploadWidget
							uploadPreset="dpjhj6bt"
							options={{
								maxFiles: 1,
								resourceType: "image",
								cloudName: "do67csxma",
								clientAllowedFormats: ["png", "webp", "jpeg", "jpg"],
								folder: "Cooksy",
								maxFileSize: 5000000
							}}
							onSuccess={(results) => {
								if (typeof results.info !== "string") {
									const id = results.info!.public_id;
									console.log(id);
									setRecipe({ ...recipe, img: id });
								}
							}}
						>
							{({ open }) => {
								function openImageUploader(e: any) {
									e.preventDefault();
									open();
								}
								return (
									<div onClick={openImageUploader} className="recipe-img-edit">
										<MdEdit />
									</div>
								);
							}}
						</CldUploadWidget>
					</div>

					<div className="recipe-name">
						<h3>Recipe Name</h3>
						<input
							type="text"
							placeholder="Name"
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
								placeholder="Servings"
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
						list={recipe.ingredient_block}
						setList={(newState) => {
							if (recipe) {
								setRecipe({
									...recipe,
									ingredient_block: newState
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
												(ingredient, ingredientIndex) => (
													<input
														key={ingredientIndex}
														type="text"
														className="column-item"
														placeholder="Item"
														id="column-item"
														value={ingredient.name}
														onChange={(e) => {
															if (recipe) {
																const updatedIngredients = [
																	...(recipe.ingredient_block![
																		index
																	].ingredient as Ingredient[])
																];

																// Update the ingredient's name
																updatedIngredients[
																	ingredientIndex
																] = {
																	...ingredient,
																	name: e.target.value,
																	id: ingredient.id!
																};

																// Update the ingredient block with the new ingredient array
																const updatedIngredientBlocks = [
																	...(recipe.ingredient_block as IngredientBlock[])
																];
																updatedIngredientBlocks[
																	index
																].ingredient = updatedIngredients;

																// Update the recipe with the modified ingredient block
																setRecipe({
																	...recipe,
																	ingredient_block:
																		updatedIngredientBlocks
																});
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
				</div>
				<div className="recipe-edit-steps">
					<div className="recipe-edit-steps-top">
						<div className="steps-title">
							<h1>Steps</h1>
						</div>
						<div className="steps-buttons">
							<button
								onClick={editRecipe}
								className="recipe-edit-save btn btn-secondary"
							>
								<RiSave2Fill /> Save
							</button>
							<button
								onClick={deleteRecipe}
								className="recipe-edit-delete btn btn-secondary"
							>
								<FaTrashAlt /> Delete
							</button>
						</div>
					</div>
					<ReactSortable
						list={recipe.steps}
						group="steps"
						handle=".step-draggable-icon"
						setList={(newState) => {
							if (recipe) {
								setRecipe({
									...recipe,
									steps: newState
								});
							}
						}}
					>
						{recipe.steps &&
							recipe.steps.map((step, index) => (
								<div key={step.id} className="step">
									<div className="step-draggable">
										<RiDraggable className="step-draggable-icon" size={50} />
									</div>
									<div className="step-order">
										{(index + 1 < 10 ? "0" : "") + (index + 1)}
									</div>
									<div className="step-info">
										<input
											type="text"
											className="step-item"
											placeholder="Name"
											id="column-item"
											value={step.name}
											onChange={(e) => {
												if (recipe) {
													recipe.steps![index].name = e.target.value;
													setRecipe({ ...recipe });
												}
											}}
										/>
										<textarea
											className="step-item"
											rows={
												recipe.steps![index].instructions.split("\n")
													.length <= 5
													? 5
													: recipe.steps![index].instructions.split("\n")
															.length + 3
											}
											placeholder="Instructions"
											id="column-item"
											value={step.instructions}
											onChange={(e) => {
												if (recipe) {
													recipe.steps![index].instructions =
														e.target.value;
													setRecipe({ ...recipe });
												}
											}}
										/>
										<span>{}</span>
									</div>
								</div>
							))}
					</ReactSortable>
					<button className="btn step-add" onClick={addStep}>
						+ Add step
					</button>
				</div>
			</div>
		);
	}
}
