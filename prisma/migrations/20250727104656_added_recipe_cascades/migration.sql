-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_ingredientBlockId_fkey";

-- DropForeignKey
ALTER TABLE "IngredientBlock" DROP CONSTRAINT "IngredientBlock_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_recipeId_fkey";

-- AddForeignKey
ALTER TABLE "IngredientBlock" ADD CONSTRAINT "IngredientBlock_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_ingredientBlockId_fkey" FOREIGN KEY ("ingredientBlockId") REFERENCES "IngredientBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
