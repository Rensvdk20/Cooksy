import EditRecipe from "@/components/recipe/EditRecipe";

export default function EditRecipePage({ params }: { params: { id: string } }) {
	return <EditRecipe params={params} />;
}
