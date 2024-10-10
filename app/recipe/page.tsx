import EditRecipe from "@/components/recipe/EditRecipe";

export default function AddRecipePage({ params }: { params: { id: string } }) {
	return <EditRecipe params={params} />;
}
